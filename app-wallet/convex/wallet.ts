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
    return await ctx.db.query("offers").collect();
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
  },
  handler: async (ctx, { userId, offerId }) => {
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
        };
      })
    );
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
  },
});

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
      offerId: undefined,
      timestamp: Date.now(),
      tokensEarnedOrSpent: amount,
    });
  },
});
