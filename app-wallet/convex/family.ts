import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFamilyDashboard = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || !user.familyPoolId) return null;

    const pool = await ctx.db.get(user.familyPoolId);
    if (!pool) return null;

    const memberDocs = await ctx.db
      .query("familyMembers")
      .withIndex("by_pool", (q) => q.eq("poolId", user.familyPoolId!))
      .collect();

    const members = await Promise.all(
      memberDocs.map(async (m) => {
        const memberUser = await ctx.db.get(m.userId);
        return {
          memberId: m._id,
          userId: m.userId,
          name: memberUser?.name ?? "Inconnu",
          greenTokensBalance: memberUser?.greenTokensBalance ?? 0,
        };
      })
    );

    return {
      pool: {
        _id: pool._id,
        name: pool.name,
        ownerId: pool.ownerId,
      },
      isOwner: pool.ownerId === userId,
      members,
    };
  },
});

export const createFamilyPool = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    totalBudgetCHF: v.number(),
  },
  handler: async (ctx, { ownerId, name, totalBudgetCHF }) => {
    const poolId = await ctx.db.insert("familyPools", {
      name,
      ownerId,
      totalBudgetCHF,
    });
    await ctx.db.insert("familyMembers", {
      poolId,
      userId: ownerId,
      allocatedBudgetCHF: 0,
    });
    await ctx.db.patch(ownerId, { familyPoolId: poolId });
    return poolId;
  },
});

export const allocateBudget = mutation({
  args: {
    poolId: v.id("familyPools"),
    memberId: v.id("familyMembers"),
    newBudgetCHF: v.number(),
  },
  handler: async (ctx, { poolId, memberId, newBudgetCHF }) => {
    const pool = await ctx.db.get(poolId);
    if (!pool) throw new Error("Cagnotte introuvable");
    const member = await ctx.db.get(memberId);
    if (!member) throw new Error("Membre introuvable");
    await ctx.db.patch(memberId, { allocatedBudgetCHF: newBudgetCHF });
    return { success: true };
  },
});

export const transferTokens = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, { fromUserId, toUserId, amount }) => {
    const [fromUser, toUser] = await Promise.all([
      ctx.db.get(fromUserId),
      ctx.db.get(toUserId),
    ]);

    if (!fromUser) throw new Error("Expéditeur introuvable");
    if (!toUser) throw new Error("Destinataire introuvable");
    if (!fromUser.familyPoolId || fromUser.familyPoolId !== toUser.familyPoolId) {
      throw new Error("Les deux utilisateurs doivent appartenir à la même cagnotte");
    }
    if (fromUser.greenTokensBalance < amount) {
      throw new Error(`Solde insuffisant : ${fromUser.greenTokensBalance} GT disponibles`);
    }

    await ctx.db.patch(fromUserId, {
      greenTokensBalance: fromUser.greenTokensBalance - amount,
    });
    await ctx.db.patch(toUserId, {
      greenTokensBalance: toUser.greenTokensBalance + amount,
    });

    const now = Date.now();
    await ctx.db.insert("transactions", {
      userId: fromUserId,
      timestamp: now,
      tokensEarnedOrSpent: -amount,
    });
    await ctx.db.insert("transactions", {
      userId: toUserId,
      timestamp: now,
      tokensEarnedOrSpent: amount,
    });

    return { success: true };
  },
});

export const seedFamilyDemo = mutation({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    const owner = await ctx.db.get(ownerId);
    if (!owner) throw new Error("Utilisateur introuvable");

    // Idempotent: tear down any existing pool for this owner
    if (owner.familyPoolId) {
      const existingMembers = await ctx.db
        .query("familyMembers")
        .withIndex("by_pool", (q) => q.eq("poolId", owner.familyPoolId!))
        .collect();
      for (const m of existingMembers) {
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(owner.familyPoolId);
      await ctx.db.patch(ownerId, { familyPoolId: undefined });
    }

    const poolId = await ctx.db.insert("familyPools", {
      name: "Famille Dupont",
      ownerId,
      totalBudgetCHF: 0,
    });

    await ctx.db.patch(ownerId, { familyPoolId: poolId });
    await ctx.db.insert("familyMembers", {
      poolId,
      userId: ownerId,
      allocatedBudgetCHF: 0,
    });

    const fakeMembers = [
      { name: "Pierre Dupont", email: "pierre@demo.com", tokens: 80 },
      { name: "Marie Dupont",  email: "marie@demo.com",  tokens: 45 },
      { name: "Lucas Dupont",  email: "lucas@demo.com",  tokens: 120 },
    ];

    for (const fm of fakeMembers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", fm.email))
        .first();

      let memberId: typeof ownerId;
      if (existing) {
        await ctx.db.patch(existing._id, {
          familyPoolId: poolId,
          greenTokensBalance: fm.tokens,
        });
        memberId = existing._id;
      } else {
        memberId = await ctx.db.insert("users", {
          name: fm.name,
          email: fm.email,
          role: "tourist",
          greenTokensBalance: fm.tokens,
          isTourist: true,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          familyPoolId: poolId,
          isActivated: true,
        });
      }

      await ctx.db.insert("familyMembers", {
        poolId,
        userId: memberId,
        allocatedBudgetCHF: 0,
      });
    }

    return { success: true };
  },
});
