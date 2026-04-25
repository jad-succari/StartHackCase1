import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").first();
  },
});

export const getOffers = query({
  args: {},
  handler: async (ctx) => {
    const offers = await ctx.db.query("offers").collect()
    return await Promise.all(
      offers.map(async (offer) => {
        const partner = await ctx.db.get(offer.partnerId)
        return {
          ...offer,
          partnerName: partner?.name ?? '',
          partnerType: partner?.type ?? '',
          partnerVillage: partner?.village ?? '',
        }
      })
    )
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
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user.greenTokensBalance;
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

    if (user.greenTokensBalance < offer.tokenCost) {
      throw new Error(
        `Insufficient balance: ${user.greenTokensBalance} tokens available, ${offer.tokenCost} required`
      );
    }

    await ctx.db.patch(userId, {
      greenTokensBalance: user.greenTokensBalance - offer.tokenCost,
    });

    await ctx.db.insert("transactions", {
      userId,
      partnerId,
      offerId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: -offer.tokenCost,
    });
  },
});

export const bookOffer = mutation({
  args: {
    userId: v.id("users"),
    offerId: v.id("offers"),
    validDate: v.optional(v.string()), // "YYYY-MM-DD"
  },
  handler: async (ctx, { userId, offerId, validDate }) => {
    const [user, offer] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.get(offerId),
    ]);

    if (!user) throw new Error(`User not found: ${userId}`);
    if (!offer) throw new Error(`Offer not found: ${offerId}`);

    if (user.greenTokensBalance < offer.tokenCost) {
      throw new Error(
        `Insufficient balance: ${user.greenTokensBalance} tokens available, ${offer.tokenCost} required`
      );
    }

    await ctx.db.patch(userId, {
      greenTokensBalance: user.greenTokensBalance - offer.tokenCost,
    });

    await ctx.db.insert("transactions", {
      userId,
      partnerId: offer.partnerId,
      offerId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: -offer.tokenCost,
    });

    const externalTicketId = `JUNG-${Math.floor(Math.random() * 100000)}`;

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
          offerTitle: offer?.title ?? "Unknown offer",
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
      return { success: false, message: "Invalid or already used ticket" };
    }

    if (ticket.validDate) {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (ticket.validDate !== today) {
        return { success: false, message: `Ticket is only valid on ${ticket.validDate}` };
      }
    }

    await ctx.db.patch(ticket._id, { status: "utilisé" });
    return { success: true, message: "Ticket validated!" };
  },
});

export const cancelTicket = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new Error("Ticket not found");
    if (ticket.status !== "valide") throw new Error("This ticket cannot be cancelled");

    const [user, offer] = await Promise.all([
      ctx.db.get(ticket.userId),
      ctx.db.get(ticket.offerId),
    ]);

    if (!user) throw new Error("User not found");

    if (offer) {
      await ctx.db.patch(ticket.userId, {
        greenTokensBalance: user.greenTokensBalance + offer.tokenCost,
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
    await ctx.db.patch(userId, {
      greenTokensBalance: user.greenTokensBalance + amount,
    });
    await ctx.db.insert("transactions", {
      userId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: amount,
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

    const totalTokensInCirculation = users.reduce(
      (sum, u) => sum + u.greenTokensBalance,
      0
    );

    const partnersWithBalance = partners.map((partner) => {
      const earned = transactions
        .filter((t) => t.partnerId === partner._id && t.tokensEarnedOrSpent < 0)
        .reduce((sum, t) => sum + Math.abs(t.tokensEarnedOrSpent), 0);

      const paidOut = payouts
        .filter((p) => p.partnerId === partner._id)
        .reduce((sum, p) => sum + p.amountTokens, 0);

      const pendingTokens = Math.max(0, earned - paidOut);

      return {
        _id: partner._id,
        name: partner.name,
        type: partner.type,
        pendingTokens,
      };
    });

    return { totalTokensInCirculation, partners: partnersWithBalance };
  },
});

export const settlePartnerAccount = mutation({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, { partnerId }) => {
    const [transactions, payouts] = await Promise.all([
      ctx.db.query("transactions").collect(),
      ctx.db
        .query("payouts")
        .withIndex("by_partnerId", (q) => q.eq("partnerId", partnerId))
        .collect(),
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
      .collect()

    return await Promise.all(
      txs.map(async (tx) => {
        const offer = tx.offerId ? await ctx.db.get(tx.offerId) : null
        return {
          _id: tx._id,
          timestamp: tx.timestamp,
          tokensEarnedOrSpent: tx.tokensEarnedOrSpent,
          label: offer?.title ?? (tx.tokensEarnedOrSpent > 0 ? 'Token purchase' : 'Tokens spent'),
        }
      })
    )
  },
})

export const earnTokens = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    partnerId: v.id("partners"),
  },
  handler: async (ctx, { userId, amount, partnerId }) => {
    if (amount <= 0) {
      throw new Error(`Amount must be positive, got: ${amount}`);
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    await ctx.db.patch(userId, {
      greenTokensBalance: user.greenTokensBalance + amount,
    });

    await ctx.db.insert("transactions", {
      userId,
      partnerId,
      timestamp: Date.now(),
      tokensEarnedOrSpent: amount,
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
          isEcoCertified: partner?.isEcoCertified ?? false,
        };
      })
    );

    const count = enriched.length;
    const totalSpent = transactions
      .filter((t) => t.tokensEarnedOrSpent < 0)
      .reduce((sum, t) => sum + Math.abs(t.tokensEarnedOrSpent), 0);

    const types = new Set(enriched.map((t) => t.partnerType));
    const balance = user?.greenTokensBalance ?? 0;

    return [
      { id: "first", emoji: "🎫", title: "First Adventure", desc: "Book your first offer", unlocked: count >= 1 },
      { id: "ski", emoji: "🎿", title: "Ski Enthusiast", desc: "Book a ski offer", unlocked: enriched.some((t) => t.partnerType === "ski") },
      { id: "eco", emoji: "🌱", title: "Eco Pioneer", desc: "Book an eco-certified activity", unlocked: enriched.some((t) => t.isEcoCertified) },
      { id: "restaurant", emoji: "🍽️", title: "Gourmet Explorer", desc: "Book a restaurant experience", unlocked: enriched.some((t) => t.partnerType === "restaurant") },
      { id: "transport", emoji: "🚠", title: "Transport Hero", desc: "Book a transport offer", unlocked: enriched.some((t) => t.partnerType === "transport") },
      { id: "blazer", emoji: "🥾", title: "Trail Blazer", desc: "Book 3 offers", unlocked: count >= 3 },
      { id: "collector", emoji: "🎯", title: "Collector", desc: "Book 5 offers", unlocked: count >= 5 },
      { id: "legend", emoji: "🌟", title: "Jungfrau Legend", desc: "Book 10 offers", unlocked: count >= 10 },
      { id: "spender", emoji: "💸", title: "Big Spender", desc: "Spend 100 GT", unlocked: totalSpent >= 100 },
      { id: "summit", emoji: "🏔️", title: "Summit Chaser", desc: "Spend 500 GT total", unlocked: totalSpent >= 500 },
      { id: "vip", emoji: "💎", title: "VIP", desc: "Hold 200+ GT in your wallet", unlocked: balance >= 200 },
      { id: "explorer", emoji: "🏆", title: "True Explorer", desc: "Book offers in 3 different categories", unlocked: types.size >= 3 },
    ];
  },
});
