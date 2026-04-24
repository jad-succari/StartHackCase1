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
