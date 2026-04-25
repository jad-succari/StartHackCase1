import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const createTourist = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    hotelName: v.optional(v.string()),
    stayStart: v.optional(v.string()),
    stayEnd: v.optional(v.string()),
    referralCodeEntered: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      return { userId: existing._id, referralCode: existing.referralCode ?? "" };
    }

    let referredBy: Id<"users"> | undefined = undefined;
    if (args.referralCodeEntered) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) =>
          q.eq("referralCode", args.referralCodeEntered)
        )
        .first();
      if (referrer) {
        referredBy = referrer._id;
        await ctx.db.patch(referrer._id, {
          greenTokensBalance: referrer.greenTokensBalance + 10,
        });
      }
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "tourist",
      greenTokensBalance: 5,
      phone: args.phone,
      hotelName: args.hotelName,
      stayStart: args.stayStart,
      stayEnd: args.stayEnd,
      referralCode,
      referredBy,
      isActivated: false,
    });

    return { userId, referralCode };
  },
});

export const activateTourist = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { isActivated: true });
  },
});

export const getTouristByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});
