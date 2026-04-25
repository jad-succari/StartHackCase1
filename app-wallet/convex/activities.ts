import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getActiveActivities = query({
  args: {},
  handler: async (ctx) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(50);

    return await Promise.all(
      activities.map(async (activity) => {
        const partner = await ctx.db.get(activity.partnerId);
        return { ...activity, partner };
      })
    );
  },
});

export const getActivityById = query({
  args: { activityId: v.id("activities") },
  handler: async (ctx, { activityId }) => {
    return await ctx.db.get(activityId);
  },
});

export const bookActivity = mutation({
  args: {
    userId: v.id("users"),
    activityId: v.id("activities"),
    scheduledAt: v.number(),
  },
  handler: async (ctx, { userId, activityId, scheduledAt }) => {
    const [user, activity] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.get(activityId),
    ]);

    if (!user) throw new Error(`User not found: ${userId}`);
    if (!activity) throw new Error(`Activity not found: ${activityId}`);
    if (!activity.isActive) throw new Error("Activity is not active");

    if (user.greenTokensBalance < activity.priceJF) {
      throw new Error(
        `Solde JF insuffisant : ${user.greenTokensBalance} JF disponibles, ${activity.priceJF} JF requis`
      );
    }

    await ctx.db.patch(userId, {
      greenTokensBalance: user.greenTokensBalance - activity.priceJF,
    });

    const ticketSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const externalTicketId = `EXT-${ticketSuffix}`;

    const bookingId = await ctx.db.insert("bookings", {
      userId,
      activityId,
      partnerId: activity.partnerId,
      status: "confirmed",
      bookedAt: Date.now(),
      scheduledAt,
      externalTicketId,
    });

    await ctx.db.insert("tokenTransactions", {
      userId,
      amount: -activity.priceJF,
      reason: `Réservation : ${activity.title}`,
      relatedBookingId: bookingId,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});
