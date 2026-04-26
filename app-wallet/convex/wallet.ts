import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function generateTxHash(): string {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").first();
  },
});

export const getOffers = query({
  args: {},
  handler: async (ctx) => {
    const offers = await ctx.db.query("offers").collect();
    const filtered = offers;
    return await Promise.all(
      filtered.map(async (offer) => {
        const partner = await ctx.db.get(offer.partnerId);
        return {
          ...offer,
          partnerName: offer.partnerName ?? partner?.name ?? "",
          partnerType: partner?.type ?? "",
          partnerVillage: partner?.locationName ?? "",
        };
      })
    );
  },
});

export const getOffer = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, { offerId }) => {
    return await ctx.db.get(offerId);
  },
});

export const getUserBalance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    return user.lakeBalance ?? user.greenTokensBalance;
  },
});

export const spendTokens = mutation({
  args: {
    userId: v.id("users"),
    offerId: v.id("offers"),
    partnerId: v.id("partners"),
  },
  handler: async (ctx, { userId, offerId, partnerId }) => {
    const [user, offer] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.get(offerId),
    ]);

    if (!user) throw new Error(`User not found: ${userId}`);
    if (!offer) throw new Error(`Offer not found: ${offerId}`);

    const balance = user.lakeBalance ?? user.greenTokensBalance;
    if (balance < offer.tokenCost) {
      throw new Error(
        `Solde insuffisant : ${balance} LAKE disponibles, ${offer.tokenCost} requis`
      );
    }

    const newBalance = balance - offer.tokenCost;
    await ctx.db.patch(userId, {
      lakeBalance: newBalance,
      greenTokensBalance: newBalance,
      weeklyScore: (user.weeklyScore ?? 0) + offer.tokenCost,
    });

    await ctx.db.insert("transactions", {
      userId,
      partnerId,
      offerId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: -offer.tokenCost,
      txHash: generateTxHash(),
      type: "spend",
      amountLAKE: offer.tokenCost,
    });
  },
});

export const bookOffer = mutation({
  args: {
    userId: v.id("users"),
    offerId: v.id("offers"),
    validDate: v.optional(v.string()),
  },
  handler: async (ctx, { userId, offerId, validDate }) => {
    const [user, offer] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.get(offerId),
    ]);

    if (!user) throw new Error(`User not found: ${userId}`);
    if (!offer) throw new Error(`Offer not found: ${offerId}`);

    const balance = user.lakeBalance ?? user.greenTokensBalance;
    if (balance < offer.tokenCost) {
      throw new Error(
        `Solde insuffisant : ${balance} LAKE disponibles, ${offer.tokenCost} requis`
      );
    }

    const newBalance = balance - offer.tokenCost;
    await ctx.db.patch(userId, {
      lakeBalance: newBalance,
      greenTokensBalance: newBalance,
      weeklyScore: (user.weeklyScore ?? 0) + offer.tokenCost,
    });

    await ctx.db.insert("transactions", {
      userId,
      partnerId: offer.partnerId,
      offerId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: -offer.tokenCost,
      txHash: generateTxHash(),
      type: "spend",
      amountLAKE: offer.tokenCost,
    });

    const externalTicketId = `LAKE-${Math.floor(Math.random() * 100000)}`;

    await ctx.db.insert("tickets", {
      userId,
      offerId,
      externalTicketId,
      status: "valide",
      purchasedAt: Date.now(),
      validDate,
    });
  },
});

export const getUserTickets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      tickets.map(async (ticket) => {
        const offer = await ctx.db.get(ticket.offerId);
        return {
          ...ticket,
          offerTitle: offer?.title ?? "Offre inconnue",
          tokenCost: offer?.tokenCost ?? 0,
          imageUrl: offer?.imageUrl ?? null,
        };
      })
    );
  },
});

export const validateTicket = mutation({
  args: { externalTicketId: v.string() },
  handler: async (ctx, { externalTicketId }) => {
    const tickets = await ctx.db.query("tickets").collect();
    const ticket = tickets.find((t) => t.externalTicketId === externalTicketId);

    if (!ticket || ticket.status !== "valide") {
      return { success: false, message: "Billet invalide ou déjà utilisé" };
    }

    if (ticket.validDate) {
      // Accept ±2h timezone window so Paris (UTC+2) and UTC server always agree.
      const nowUtc = Date.now()
      const toDateStr = (offsetMs: number) => {
        const d = new Date(nowUtc + offsetMs)
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
      }
      const validDates: string[] = [
        toDateStr(-7200000), toDateStr(0), toDateStr(3600000), toDateStr(7200000),
      ]
      if (!validDates.includes(ticket.validDate as string)) {
        return { success: false, message: `Billet valable uniquement le ${ticket.validDate}` };
      }
    }

    await ctx.db.patch(ticket._id, { status: "utilisé" });
    return { success: true, message: "Billet validé !" };
  },
});

export const cancelTicket = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new Error("Billet introuvable");
    if (ticket.status !== "valide") throw new Error("Ce billet ne peut pas être annulé");

    const [user, offer] = await Promise.all([
      ctx.db.get(ticket.userId),
      ctx.db.get(ticket.offerId),
    ]);

    if (!user) throw new Error("Utilisateur introuvable");

    if (offer) {
      const balance = user.lakeBalance ?? user.greenTokensBalance;
      const newBalance = balance + offer.tokenCost;
      await ctx.db.patch(ticket.userId, {
        lakeBalance: newBalance,
        greenTokensBalance: newBalance,
      });
      await ctx.db.insert("transactions", {
        userId: ticket.userId,
        partnerId: offer.partnerId,
        offerId: ticket.offerId,
        timestamp: Date.now(),
        tokensEarnedOrSpent: offer.tokenCost,
        txHash: generateTxHash(),
        type: "cashback",
        amountLAKE: offer.tokenCost,
      });
    }

    await ctx.db.patch(ticketId, { status: "annulé" });
  },
});

export const addTokens = mutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, { userId, amount }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    const balance = user.lakeBalance ?? user.greenTokensBalance;
    const newBalance = balance + amount;
    await ctx.db.patch(userId, {
      lakeBalance: newBalance,
      greenTokensBalance: newBalance,
    });
    await ctx.db.insert("transactions", {
      userId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: amount,
      txHash: generateTxHash(),
      type: "earn",
      amountLAKE: amount,
    });
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const [users, partners, transactions, payouts] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("partners").collect(),
      ctx.db.query("transactions").collect(),
      ctx.db.query("payouts").collect(),
    ]);

    const totalLAKEInCirculation = users.reduce(
      (sum, u) => sum + (u.lakeBalance ?? u.greenTokensBalance),
      0
    );

    const partnersWithBalance = partners.map((partner) => {
      const earned = transactions
        .filter((t) => t.partnerId === partner._id && t.tokensEarnedOrSpent < 0)
        .reduce((sum, t) => sum + Math.abs(t.tokensEarnedOrSpent), 0);

      const paidOut = payouts
        .filter((p) => p.partnerId === partner._id)
        .reduce((sum, p) => sum + p.amountTokens, 0);

      return {
        _id: partner._id,
        name: partner.name,
        type: partner.type,
        pendingTokens: Math.max(0, earned - paidOut),
      };
    });

    return {
      totalLAKEInCirculation,
      totalTokensInCirculation: totalLAKEInCirculation,
      partners: partnersWithBalance,
    };
  },
});

export const settlePartnerAccount = mutation({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, { partnerId }) => {
    const [transactions, payouts] = await Promise.all([
      ctx.db.query("transactions").collect(),
      ctx.db.query("payouts").withIndex("by_partnerId", (q) => q.eq("partnerId", partnerId)).collect(),
    ]);

    const earned = transactions
      .filter((t) => t.partnerId === partnerId && t.tokensEarnedOrSpent < 0)
      .reduce((sum, t) => sum + Math.abs(t.tokensEarnedOrSpent), 0);

    const paidOut = payouts.reduce((sum, p) => sum + p.amountTokens, 0);
    const pending = earned - paidOut;
    if (pending <= 0) return;

    await ctx.db.insert("payouts", {
      partnerId,
      amountTokens: pending,
      settledAt: Date.now(),
    });
  },
});

export const getUserTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      txs.map(async (tx) => {
        const offer = tx.offerId ? await ctx.db.get(tx.offerId) : null;
        return {
          _id: tx._id,
          timestamp: tx.timestamp,
          tokensEarnedOrSpent: tx.tokensEarnedOrSpent,
          amountLAKE: tx.amountLAKE ?? Math.abs(tx.tokensEarnedOrSpent),
          type: tx.type ?? (tx.tokensEarnedOrSpent > 0 ? "earn" : "spend"),
          txHash: tx.txHash,
          label: offer?.title ?? (tx.tokensEarnedOrSpent > 0 ? "LAKE Reward" : "LAKE Spend"),
        };
      })
    );
  },
});

export const earnTokens = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    partnerId: v.id("partners"),
  },
  handler: async (ctx, { userId, amount, partnerId }) => {
    if (amount <= 0) throw new Error(`Le montant doit être positif, reçu : ${amount}`);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const balance = user.lakeBalance ?? user.greenTokensBalance;
    const newBalance = balance + amount;
    await ctx.db.patch(userId, {
      lakeBalance: newBalance,
      greenTokensBalance: newBalance,
      weeklyScore: (user.weeklyScore ?? 0) + amount,
    });

    await ctx.db.insert("transactions", {
      userId,
      partnerId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: amount,
      txHash: generateTxHash(),
      type: "earn",
      amountLAKE: amount,
    });
  },
});

export const getBadges = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [tickets, transactions, user] = await Promise.all([
      ctx.db.query("tickets").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("transactions").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.get(userId),
    ]);

    const enriched = await Promise.all(
      tickets.map(async (t) => {
        const offer = await ctx.db.get(t.offerId);
        const partner = offer ? await ctx.db.get(offer.partnerId) : null;
        return {
          ...t,
          partnerType: partner?.type ?? "",
          isEco: partner?.isEco ?? false,
        };
      })
    );

    const count = enriched.length;
    const totalSpent = transactions
      .filter((t) => t.tokensEarnedOrSpent < 0)
      .reduce((sum, t) => sum + Math.abs(t.tokensEarnedOrSpent), 0);

    const types = new Set(enriched.map((t) => t.partnerType));
    const balance = user ? (user.lakeBalance ?? user.greenTokensBalance) : 0;

    return [
      { id: "first", emoji: "🎫", title: "Première Aventure", desc: "Réserver votre première offre", unlocked: count >= 1 },
      { id: "ski", emoji: "🎿", title: "Passionné de Ski", desc: "Réserver une offre ski", unlocked: enriched.some((t) => t.partnerType === "ski") },
      { id: "eco", emoji: "🌱", title: "Éco Pionnier", desc: "Réserver une activité éco-certifiée", unlocked: enriched.some((t) => t.isEco) },
      { id: "restaurant", emoji: "🍽️", title: "Explorateur Gourmet", desc: "Réserver une expérience restaurant", unlocked: enriched.some((t) => t.partnerType === "restaurant") },
      { id: "transport", emoji: "🚠", title: "Héros du Transport", desc: "Réserver une offre transport", unlocked: enriched.some((t) => t.partnerType === "transport") },
      { id: "blazer", emoji: "🥾", title: "Trail Blazer", desc: "Réserver 3 offres", unlocked: count >= 3 },
      { id: "collector", emoji: "🎯", title: "Collectionneur", desc: "Réserver 5 offres", unlocked: count >= 5 },
      { id: "legend", emoji: "🌟", title: "Légende Jungfrau", desc: "Réserver 10 offres", unlocked: count >= 10 },
      { id: "spender", emoji: "💸", title: "Grand Dépensier", desc: "Dépenser 100 LAKE", unlocked: totalSpent >= 100 },
      { id: "summit", emoji: "🏔️", title: "Chasseur de Sommets", desc: "Dépenser 500 LAKE au total", unlocked: totalSpent >= 500 },
      { id: "vip", emoji: "💎", title: "VIP", desc: "Détenir 200+ LAKE dans votre wallet", unlocked: balance >= 200 },
      { id: "explorer", emoji: "🏆", title: "Vrai Explorateur", desc: "Réserver dans 3 catégories différentes", unlocked: types.size >= 3 },
    ];
  },
});
