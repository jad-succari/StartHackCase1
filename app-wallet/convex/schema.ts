import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("tourist"), v.literal("partner"), v.literal("admin")),
    jfBalance: v.number(),
    passSerialNumber: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  partners: defineTable({
    name: v.string(),
    type: v.string(),
    description: v.string(),
    village: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    isEcoCertified: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_village", ["village"])
    .index("by_isActive", ["isActive"]),

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
});
