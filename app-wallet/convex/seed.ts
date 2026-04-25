import { mutation } from "./_generated/server";

function generateSafeAddress(): string {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 40 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

function generateTxHash(): string {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

async function runInsertLogic(ctx: any) {
  const jungfraubahnId = await ctx.db.insert("partners", {
    name: "Jungfraubahn",
    type: "transport",
    category: "Transport",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.5751,
    lng: 7.9857,
    isEco: true,
  });

  const allmendbahnId = await ctx.db.insert("partners", {
    name: "Allmendbahn Mürren",
    type: "transport",
    category: "Transport",
    location: "Mürren, CH",
    locationName: "Mürren",
    lat: 46.5592,
    lng: 7.8986,
    isEco: true,
  });

  const murrenSportsId = await ctx.db.insert("partners", {
    name: "Mürren Alpine Sports",
    type: "activity",
    category: "Activity",
    location: "Mürren, CH",
    locationName: "Mürren",
    lat: 46.5605,
    lng: 7.8930,
    isEco: false,
  });

  const jungfrauTourismId = await ctx.db.insert("partners", {
    name: "Jungfrau Tourism",
    type: "activity",
    category: "Activity",
    location: "Interlaken, CH",
    locationName: "Interlaken",
    lat: 46.6863,
    lng: 7.8632,
    isEco: true,
  });

  const grindelwaldSportsId = await ctx.db.insert("partners", {
    name: "Grindelwald Sports",
    type: "ski",
    category: "Ski",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.6244,
    lng: 8.0409,
    isEco: false,
  });

  await ctx.db.insert("offers", {
    partnerId: jungfraubahnId,
    title: "Hiking trail day pass Lauterbrunnen",
    partnerName: "Jungfraubahn",
    category: "Activity",
    locationName: "Grindelwald",
    isEco: true,
    isActive: true,
    description: "Round-trip hiking day pass through the scenic Lauterbrunnen valley trails",
    tokenCost: 14,
    discountPercentage: 31,
    originalPriceCHF: 29,
    imageUrl: "https://picsum.photos/seed/hike1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: jungfraubahnId,
    title: "Cable car ticket from Wengen",
    partnerName: "Jungfraubahn",
    category: "Transport",
    locationName: "Grindelwald",
    isEco: true,
    isActive: true,
    description: "Cable car ticket from Wengen to the alpine viewpoint with stunning Eiger views",
    tokenCost: 14,
    discountPercentage: 20,
    originalPriceCHF: 29,
    imageUrl: "https://picsum.photos/seed/wengen1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: jungfrauTourismId,
    title: "Virtual guided tour of Jungfrau region",
    partnerName: "Jungfrau Tourism",
    category: "Activity",
    locationName: "Interlaken",
    isEco: true,
    isActive: true,
    description: "Full-day virtual guided tour covering all the highlights of the Jungfrau region",
    tokenCost: 125,
    discountPercentage: 34,
    originalPriceCHF: 250,
    imageUrl: "https://picsum.photos/seed/virtual1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: jungfrauTourismId,
    title: "Personal travel planning session",
    partnerName: "Jungfrau Tourism",
    category: "Activity",
    locationName: "Interlaken",
    isEco: true,
    isActive: true,
    description: "One-on-one travel planning with a local Jungfrau region expert for a personalized itinerary",
    tokenCost: 100,
    discountPercentage: 16,
    originalPriceCHF: 200,
    imageUrl: "https://picsum.photos/seed/travel1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: jungfrauTourismId,
    title: "Mountain guide consultation",
    partnerName: "Jungfrau Tourism",
    category: "Activity",
    locationName: "Interlaken",
    isEco: true,
    isActive: true,
    description: "45 minutes of expert mountain guide consultation for your Jungfrau adventure",
    tokenCost: 42,
    discountPercentage: 21,
    originalPriceCHF: 80,
    imageUrl: "https://picsum.photos/seed/guide1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: murrenSportsId,
    title: "Tandem paragliding Lauterbrunnen valley",
    partnerName: "Mürren Alpine Sports",
    category: "Activity",
    locationName: "Mürren",
    isEco: false,
    isActive: true,
    description: "Thrilling tandem paragliding flight over the Lauterbrunnen valley with a certified pilot",
    tokenCost: 42,
    discountPercentage: 31,
    originalPriceCHF: 190,
    imageUrl: "https://picsum.photos/seed/parapente1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: allmendbahnId,
    title: "Schilthorn Piz Gloria dining experience",
    partnerName: "Allmendbahn Mürren",
    category: "Restaurant",
    locationName: "Mürren",
    isEco: false,
    isActive: true,
    description: "Traditional Swiss alpine dining at the iconic Schilthorn Piz Gloria revolving restaurant",
    tokenCost: 60,
    discountPercentage: 19,
    originalPriceCHF: 321,
    imageUrl: "https://picsum.photos/seed/restaurant1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: grindelwaldSportsId,
    title: "Grindelwald First ski day pass",
    partnerName: "Grindelwald Sports",
    category: "Ski",
    locationName: "Grindelwald",
    isEco: false,
    isActive: true,
    description: "Full-day ski access to Grindelwald First with stunning views of the Eiger, Mönch and Jungfrau",
    tokenCost: 90,
    discountPercentage: 25,
    originalPriceCHF: 180,
    imageUrl: "https://picsum.photos/seed/ski1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: allmendbahnId,
    title: "Almendbahn ticket from Mürren or Stechelberg",
    partnerName: "Allmendbahn Mürren",
    category: "Transport",
    locationName: "Mürren",
    isEco: true,
    isActive: true,
    description: "Cable car access to the beautiful Allmendhuben alpine meadows above Mürren",
    tokenCost: 8,
    discountPercentage: 28,
    originalPriceCHF: 16,
    imageUrl: "https://picsum.photos/seed/cable1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: allmendbahnId,
    title: "Schilthorn ticket from Mürren or Stechelberg",
    partnerName: "Allmendbahn Mürren",
    category: "Transport",
    locationName: "Mürren",
    isEco: true,
    isActive: true,
    description: "Round trip cable car ticket from Stechelberg or Mürren to Schilthorn with 360° panoramic views",
    tokenCost: 34,
    discountPercentage: 28,
    originalPriceCHF: 69,
    imageUrl: "https://picsum.photos/seed/schilthorn1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: allmendbahnId,
    title: "Allmendhuben family fun including train ticket and lunch",
    partnerName: "Allmendbahn Mürren",
    category: "Activity",
    locationName: "Mürren",
    isEco: true,
    isActive: true,
    description: "Family adventure with train ticket to Allmendhuben and alpine lunch included",
    tokenCost: 43,
    discountPercentage: 15,
    originalPriceCHF: 79,
    imageUrl: "https://picsum.photos/seed/family1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: murrenSportsId,
    title: "Mürren via ferrata for beginners",
    partnerName: "Mürren Alpine Sports",
    category: "Activity",
    locationName: "Mürren",
    isEco: false,
    isActive: true,
    description: "Guided via ferrata adventure in Mürren for first-timers with professional guide",
    tokenCost: 90,
    discountPercentage: 18,
    originalPriceCHF: 175,
    imageUrl: "https://picsum.photos/seed/ferrata1/300/200",
  });

  const userId = await ctx.db.insert("users", {
    isTourist: true,
    name: "Alex",
    email: "alex@etherlaken.ch",
    greenTokensBalance: 1890,
    lakeBalance: 1890,
    safeAddress: generateSafeAddress(),
    referralCode: "ALEX42",
    weeklyScore: 150,
    isActivated: true,
  });

  await ctx.db.insert("transactions", {
    userId,
    partnerId: allmendbahnId,
    tokensEarnedOrSpent: 500,
    type: "earn",
    amountLAKE: 500,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 5,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: allmendbahnId,
    tokensEarnedOrSpent: -43,
    type: "spend",
    amountLAKE: 43,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 4,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: murrenSportsId,
    tokensEarnedOrSpent: -90,
    type: "spend",
    amountLAKE: 90,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 3,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: jungfrauTourismId,
    tokensEarnedOrSpent: 1523,
    type: "earn",
    amountLAKE: 1523,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 2,
  });

  return { message: "Seeded: 1 user, 5 partners, 12 offers, 4 transactions" };
}

export const populateData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("users").first();
    if (existing) return { message: "Data already populated — run resetAndSeed first" };
    return runInsertLogic(ctx);
  },
});

export const resetAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const [familyMembers, familyPools, transactions, tickets, payouts, offers, partners, users] =
      await Promise.all([
        ctx.db.query("familyMembers").collect(),
        ctx.db.query("familyPools").collect(),
        ctx.db.query("transactions").collect(),
        ctx.db.query("tickets").collect(),
        ctx.db.query("payouts").collect(),
        ctx.db.query("offers").collect(),
        ctx.db.query("partners").collect(),
        ctx.db.query("users").collect(),
      ]);

    for (const doc of [
      ...familyMembers,
      ...familyPools,
      ...transactions,
      ...tickets,
      ...payouts,
      ...offers,
      ...partners,
      ...users,
    ]) {
      await ctx.db.delete(doc._id);
    }

    return runInsertLogic(ctx);
  },
});
