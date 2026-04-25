import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    isTourist: v.optional(v.boolean()),
    name: v.string(),
    email: v.string(),
    // Legacy field kept for compat — lakeBalance is source of truth
    greenTokensBalance: v.number(),
    // Web3 (simulated Safe Smart Account on Gnosis Chain)
    safeAddress: v.optional(v.string()),
    lakeBalance: v.optional(v.number()),
    // Referral
    referralCode: v.optional(v.string()),
    referredBy: v.optional(v.id("users")),
    // Family
    familyPoolId: v.optional(v.id("familyPools")),
    // Activity
    weeklyScore: v.optional(v.number()),
    isActivated: v.optional(v.boolean()),
    // Legacy fields kept for auth/registration compat
    role: v.optional(v.union(v.literal("tourist"), v.literal("partner"), v.literal("admin"))),
    phone: v.optional(v.string()),
    hotelName: v.optional(v.string()),
    stayStart: v.optional(v.string()),
    stayEnd: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_referral_code", ["referralCode"])
    .index("by_family_pool", ["familyPoolId"]),

  partners: defineTable({
    name: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    locationName: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    isEco: v.optional(v.boolean()),
    // Legacy fields from old documents
    description: v.optional(v.string()),
    village: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isEcoCertified: v.optional(v.boolean()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  }),

  offers: defineTable({
    partnerId: v.id("partners"),
    title: v.string(),
    description: v.string(),
    tokenCost: v.number(),
    discountPercentage: v.optional(v.number()),
    category: v.optional(v.string()),
    partnerName: v.optional(v.string()),
    locationName: v.optional(v.string()),
    isEco: v.optional(v.boolean()),
    savingsCHF: v.optional(v.number()),
    originalPriceCHF: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  }).index("by_partnerId", ["partnerId"]),

  transactions: defineTable({
    userId: v.id("users"),
    partnerId: v.optional(v.id("partners")),
    offerId: v.optional(v.id("offers")),
    timestamp: v.number(),
    tokensEarnedOrSpent: v.number(),
    // Web3 fields (simulated)
    txHash: v.optional(v.string()),
    type: v.optional(v.string()),
    amountLAKE: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  familyPools: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    totalBudgetLAKE: v.optional(v.number()),
    totalBudgetCHF: v.optional(v.number()),
  })
  
    .index("by_ownerId", ["ownerId"]),

  familyMembers: defineTable({
    poolId: v.id("familyPools"),
    userId: v.id("users"),
    allocatedBudgetCHF: v.optional(v.number()),
  })
    .index("by_pool", ["poolId"])
    .index("by_user", ["userId"]),

  // Legacy tables — kept for wallet booking/ticket/payout flows
  tickets: defineTable({
    userId: v.id("users"),
    offerId: v.id("offers"),
    externalTicketId: v.string(),
    status: v.string(),
    purchasedAt: v.number(),
    validDate: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  payouts: defineTable({
    partnerId: v.id("partners"),
    amountTokens: v.number(),
    settledAt: v.number(),
  }).index("by_partnerId", ["partnerId"]),

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
});
