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
  const schilthornId = await ctx.db.insert("partners", {
    name: "Schilthornbahn AG",
    type: "transport",
    category: "Transport",
    location: "Mürren, CH",
    locationName: "Mürren",
    lat: 46.5592,
    lng: 7.8986,
    isEco: true,
  });

  const jungfrauId = await ctx.db.insert("partners", {
    name: "Jungfrau Railways",
    type: "transport",
    category: "Transport",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.5751,
    lng: 7.9857,
    isEco: true,
  });

  const grindelwaldId = await ctx.db.insert("partners", {
    name: "Grindelwald Sports",
    type: "ski",
    category: "Ski",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.6244,
    lng: 8.0409,
    isEco: false,
  });

  const restaurantId = await ctx.db.insert("partners", {
    name: "Restaurant Zur Mühle",
    type: "restaurant",
    category: "Restaurant",
    location: "Interlaken, CH",
    locationName: "Interlaken",
    lat: 46.6863,
    lng: 7.8632,
    isEco: true,
  });

  const harderId = await ctx.db.insert("partners", {
    name: "Harder Kulm",
    type: "activity",
    category: "Activité",
    location: "Interlaken, CH",
    locationName: "Interlaken",
    lat: 46.7012,
    lng: 7.8756,
    isEco: false,
  });

  await ctx.db.insert("offers", {
    partnerId: schilthornId,
    title: "Schilthorn · Piz Gloria",
    partnerName: "Schilthornbahn AG",
    category: "Transport",
    locationName: "Mürren",
    isEco: true,
    description: "Accès panoramique · Câble car",
    tokenCost: 90,
    discountPercentage: 20,
    savingsCHF: 42,
    imageUrl: "https://picsum.photos/seed/mountain1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: jungfrauId,
    title: "Jungfraujoch",
    partnerName: "Jungfrau Railways",
    category: "Transport",
    locationName: "Grindelwald",
    isEco: true,
    description: "Top of Europe · Train à crémaillère",
    tokenCost: 150,
    discountPercentage: 15,
    savingsCHF: 38,
    imageUrl: "https://picsum.photos/seed/mountain2/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: grindelwaldId,
    title: "Ski Grindelwald First",
    partnerName: "Grindelwald Sports",
    category: "Ski",
    locationName: "Grindelwald",
    isEco: false,
    description: "Domaine skiable · Pistes toutes niveaux",
    tokenCost: 120,
    discountPercentage: 25,
    savingsCHF: 55,
    imageUrl: "https://picsum.photos/seed/ski1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: restaurantId,
    title: "Fondue au chalet",
    partnerName: "Restaurant Zur Mühle",
    category: "Restaurant",
    locationName: "Interlaken",
    isEco: true,
    description: "Fondue traditionnelle · Produits locaux",
    tokenCost: 30,
    discountPercentage: 20,
    savingsCHF: 18,
    imageUrl: "https://picsum.photos/seed/food1/300/200",
  });

  await ctx.db.insert("offers", {
    partnerId: harderId,
    title: "Harder Kulm · Vue 360°",
    partnerName: "Harder Kulm",
    category: "Activité",
    locationName: "Interlaken",
    isEco: false,
    description: "Téléphérique · Panorama Alpes",
    tokenCost: 60,
    discountPercentage: 30,
    savingsCHF: 22,
    imageUrl: "https://picsum.photos/seed/view1/300/200",
  });

  const userId = await ctx.db.insert("users", {
    isTourist: true,
    name: "Sophie",
    email: "sophie@etherlaken.ch",
    greenTokensBalance: 1240,
    lakeBalance: 1240,
    safeAddress: generateSafeAddress(),
    referralCode: "DEMO42",
    weeklyScore: 150,
    isActivated: true,
  });

  await ctx.db.insert("transactions", {
    userId,
    partnerId: schilthornId,
    tokensEarnedOrSpent: 150,
    type: "earn",
    amountLAKE: 150,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 5,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: schilthornId,
    tokensEarnedOrSpent: -90,
    type: "spend",
    amountLAKE: 90,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 4,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: restaurantId,
    tokensEarnedOrSpent: 20,
    type: "cashback",
    amountLAKE: 20,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 3,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: restaurantId,
    tokensEarnedOrSpent: -30,
    type: "spend",
    amountLAKE: 30,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 2,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: jungfrauId,
    tokensEarnedOrSpent: 20,
    type: "transfer",
    amountLAKE: 20,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 1,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: grindelwaldId,
    tokensEarnedOrSpent: -60,
    type: "spend",
    amountLAKE: 60,
    txHash: generateTxHash(),
    timestamp: Date.now(),
  });

  return { message: "Seeded: 1 user, 5 partners, 5 offers, 6 transactions" };
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
