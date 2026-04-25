import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export { generateCode };

export const applyReferral = mutation({
  args: {
    newUserId: v.id("users"),
    referralCode: v.string(),
  },
  handler: async (ctx, { newUserId, referralCode }) => {
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
      .unique();

    if (!referrer) throw new Error("Code invalide");

    const newUser = await ctx.db.get(newUserId);
    if (!newUser) throw new Error("Utilisateur introuvable");

    // +20 GT for both
    await ctx.db.patch(referrer._id, {
      greenTokensBalance: referrer.greenTokensBalance + 20,
    });
    await ctx.db.patch(newUserId, {
      greenTokensBalance: newUser.greenTokensBalance + 20,
      referredBy: referrer._id,
    });

    let poolId = referrer.familyPoolId;

    if (poolId) {
      // Referrer already has a pool — add new member
      await ctx.db.insert("familyMembers", {
        poolId,
        userId: newUserId,
        allocatedBudgetCHF: 0,
      });
      await ctx.db.patch(newUserId, { familyPoolId: poolId });
    } else {
      // Create a new family pool for the referrer
      poolId = await ctx.db.insert("familyPools", {
        name: `${referrer.name} & famille`,
        ownerId: referrer._id,
        totalBudgetLAKE: 0,
      });
      await ctx.db.insert("familyMembers", {
        poolId,
        userId: referrer._id,
        allocatedBudgetCHF: 0,
      });
      await ctx.db.insert("familyMembers", {
        poolId,
        userId: newUserId,
        allocatedBudgetCHF: 0,
      });
      await ctx.db.patch(referrer._id, { familyPoolId: poolId });
      await ctx.db.patch(newUserId, { familyPoolId: poolId });
    }

    const now = Date.now();
    await ctx.db.insert("transactions", {
      userId: referrer._id,
      timestamp: now,
      tokensEarnedOrSpent: 20,
    });
    await ctx.db.insert("transactions", {
      userId: newUserId,
      timestamp: now,
      tokensEarnedOrSpent: 20,
    });

    return { success: true, referrerName: referrer.name, joinedFamily: true };
  },
});

export const getReferralStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    let familySize = 0;
    if (user.familyPoolId) {
      const members = await ctx.db
        .query("familyMembers")
        .withIndex("by_pool", (q) => q.eq("poolId", user.familyPoolId!))
        .collect();
      familySize = members.length;
    }

    // Count how many users listed this user as referrer (bounded for demo scale)
    const allUsers = await ctx.db.query("users").take(200);
    const referralCount = allUsers.filter((u) => u.referredBy === userId).length;

    return {
      referralCode: user.referralCode ?? "",
      familySize,
      tokensEarnedFromReferrals: referralCount * 20,
    };
  },
});
