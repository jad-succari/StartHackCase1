import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateSafeAddress(): string {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 40 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

function generateTxHash(): string {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

export const getUserWallet = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      name: user.name,
      safeAddress: user.safeAddress ?? generateSafeAddress(),
      lakeBalance: user.lakeBalance ?? user.greenTokensBalance,
      network: "Gnosis Chain",
      chainId: 100,
      tokenSymbol: "LAKE",
      tokenName: "EtherLaken Token",
      contractAddress: "0x4ecaba5870353805a9f068101a40e0f32ed605c8",
    };
  },
});

export const getWalletTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      txs.map(async (tx) => {
        const partner = tx.partnerId ? await ctx.db.get(tx.partnerId) : null;
        return {
          _id: tx._id,
          timestamp: tx.timestamp,
          amountLAKE: tx.amountLAKE ?? Math.abs(tx.tokensEarnedOrSpent),
          type: tx.type ?? (tx.tokensEarnedOrSpent > 0 ? "earn" : "spend"),
          partnerName: partner?.name ?? "Inconnu",
          txHash: tx.txHash ?? generateTxHash(),
          isPositive: tx.tokensEarnedOrSpent > 0,
        };
      })
    );
  },
});

export const initWallet = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable");

    if (user.safeAddress) {
      return { safeAddress: user.safeAddress, alreadyInit: true };
    }

    const addr = generateSafeAddress();
    await ctx.db.patch(userId, {
      safeAddress: addr,
      lakeBalance: user.lakeBalance ?? user.greenTokensBalance,
    });
    return { safeAddress: addr, alreadyInit: false };
  },
});
