import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("tourist"), v.literal("partner"), v.literal("admin"))),
    greenTokensBalance: v.number(),
    passSerialNumber: v.optional(v.string()),
    isTourist: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  partners: defineTable({
    name: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    village: v.optional(v.string()),
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    isEcoCertified: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  }),

  activities: defineTable({
    partnerId: v.id("partners"),
    title: v.string(),
    description: v.string(),
    priceJF: v.number(),
    originalPriceCHF: v.number(),
    durationMinutes: v.number(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_partnerId", ["partnerId"])
    .index("by_isActive", ["isActive"])
    .index("by_partnerId_and_isActive", ["partnerId", "isActive"]),

  bookings: defineTable({
    userId: v.id("users"),
    activityId: v.id("activities"),
    partnerId: v.id("partners"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("used"),
      v.literal("cancelled")
    ),
    bookedAt: v.number(),
    scheduledAt: v.number(),
    externalTicketId: v.optional(v.string()),
    boardingPassUrl: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_partnerId", ["partnerId"])
    .index("by_userId_and_status", ["userId", "status"]),

  tokenTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    relatedBookingId: v.optional(v.id("bookings")),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  offers: defineTable({
    partnerId: v.id("partners"),
    title: v.string(),
    description: v.string(),
    tokenCost: v.number(),
    originalPriceCHF: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    discountPercentage: v.optional(v.number()),
  }).index("by_partnerId", ["partnerId"]),

  transactions: defineTable({
    userId: v.id("users"),
    partnerId: v.id("partners"),
    offerId: v.optional(v.id("offers")),
    timestamp: v.number(),
    tokensEarnedOrSpent: v.number(),
  }).index("by_userId", ["userId"]),

  tickets: defineTable({
    userId: v.id("users"),
    offerId: v.id("offers"),
    externalTicketId: v.string(),
    status: v.string(),
    purchasedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
