import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    isTourist: v.boolean(),
    name: v.string(),
    email: v.string(),
    greenTokensBalance: v.number(),
  }),

  partners: defineTable({
    name: v.string(),
    type: v.string(),
    location: v.string(),
  }),

  offers: defineTable({
    partnerId: v.id("partners"),
    title: v.string(),
    description: v.string(),
    tokenCost: v.number(),
    discountPercentage: v.number(),
  }),

  transactions: defineTable({
    userId: v.id("users"),
    partnerId: v.id("partners"),
    offerId: v.optional(v.id("offers")),
    timestamp: v.number(),
    tokensEarnedOrSpent: v.number(),
  }),
});
