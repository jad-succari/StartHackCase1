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
  // ── Real Jungfrau Region Partners with accurate GPS ──────────────────────────

  const jungfrauRailId = await ctx.db.insert("partners", {
    name: "Jungfrau Railways",
    type: "transport",
    category: "Transport",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.6244,
    lng: 8.0409,
    isEco: true,
    description: "Mountain railways connecting Grindelwald to Jungfraujoch — Top of Europe at 3,454 m",
  });

  const maennlichenId = await ctx.db.insert("partners", {
    name: "Gondelbahn Grindelwald-Männlichen",
    type: "transport",
    category: "Transport",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.6199,
    lng: 8.0401,
    isEco: true,
    description: "Europe's longest gondola ropeway (6.2 km) from Grindelwald to Männlichen summit at 2,229 m",
  });

  const gletscherschluchtId = await ctx.db.insert("partners", {
    name: "Gletscherschlucht Grindelwald",
    type: "activity",
    category: "Activity",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.6131,
    lng: 8.0322,
    isEco: false,
    description: "Natural gorge carved by the Lower Grindelwald Glacier with dramatic 300m rock walls",
  });

  const trümmelbachId = await ctx.db.insert("partners", {
    name: "Trümmelbach Gletscherwasserfälle",
    type: "activity",
    category: "Activity",
    location: "Lauterbrunnen, CH",
    locationName: "Lauterbrunnen",
    lat: 46.5614,
    lng: 7.9113,
    isEco: true,
    description: "Europe's largest subterranean waterfalls inside the mountain — 20,000 L/s draining the Jungfrau glaciers",
  });

  const aareschluchtId = await ctx.db.insert("partners", {
    name: "Aareschlucht AG",
    type: "activity",
    category: "Activity",
    location: "Meiringen, CH",
    locationName: "Meiringen",
    lat: 46.72005,
    lng: 8.20461,
    isEco: true,
    description: "Spectacular 1.4 km gorge up to 200m deep carved by the Aare river — between Meiringen and Innertkirchen",
  });

  const beatusId = await ctx.db.insert("partners", {
    name: "St. Beatus-Höhlen",
    type: "activity",
    category: "Activity",
    location: "Sundlauenen, CH",
    locationName: "Sundlauenen",
    lat: 46.6849027,
    lng: 7.7812703,
    isEco: true,
    description: "Fascinating stalactite cave system above Lake Thun — 1 km guided tour with underground waterfalls and cave museum",
  });

  const ballenbergId = await ctx.db.insert("partners", {
    name: "Freilichtmuseum Ballenberg",
    type: "activity",
    category: "Activity",
    location: "Hofstetten bei Brienz, CH",
    locationName: "Brienz",
    lat: 46.7455,
    lng: 8.0633,
    isEco: true,
    description: "Open-air museum with 100 authentic Swiss rural buildings from across Switzerland on 66 hectares",
  });

  const airGlaciersId = await ctx.db.insert("partners", {
    name: "Air-Glaciers SA",
    type: "activity",
    category: "Activity",
    location: "Lauterbrunnen, CH",
    locationName: "Lauterbrunnen",
    lat: 46.5948,
    lng: 7.9087,
    isEco: false,
    description: "Alpine helicopter tours over the Jungfrau massif and Matterhorn — the most spectacular aerial Alpine experience",
  });

  const grindelwaldSportsId = await ctx.db.insert("partners", {
    name: "Grindelwald Sports",
    type: "ski",
    category: "Ski",
    location: "Grindelwald, CH",
    locationName: "Grindelwald",
    lat: 46.6244,
    lng: 8.0500,
    isEco: false,
    description: "Ski rental, lessons and day passes for the Kleine Scheidegg–Männlichen ski area — 213 km of pistes",
  });

  const schwarzwaldalpId = await ctx.db.insert("partners", {
    name: "Chalet Schwarzwaldalp",
    type: "restaurant",
    category: "Restaurant",
    location: "Rosenlaui, CH",
    locationName: "Meiringen",
    lat: 46.7273,
    lng: 8.1040,
    isEco: true,
    description: "Historic alpine restaurant in the Rosenlaui valley — traditional Swiss cuisine with local cheese and homemade specialties",
  });

  // ── 12 Real Offers from the Jungfrau Region Guest Card Program ───────────────

  await ctx.db.insert("offers", {
    partnerId: jungfrauRailId,
    title: "First Cliff Walk & First Flyer zipline",
    partnerName: "Jungfrau Railways",
    category: "Activity",
    locationName: "Grindelwald",
    isEco: true,
    isActive: true,
    description: "Access to the spectacular First Cliff Walk suspension bridge and First Flyer zipline at 2,168 m altitude",
    tokenCost: 15,
    discountPercentage: 15,
    originalPriceCHF: 35,
    savingsCHF: 5,
    // Dramatic suspension bridge crossing a mountain gorge
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: maennlichenId,
    title: "Gondola Grindelwald → Männlichen — return",
    partnerName: "Gondelbahn Grindelwald-Männlichen",
    category: "Transport",
    locationName: "Grindelwald",
    isEco: true,
    isActive: true,
    description: "Return ticket on Europe's longest gondola ropeway to Männlichen (2,229 m) — panoramic Eiger, Mönch & Jungfrau views",
    tokenCost: 15,
    discountPercentage: 30,
    originalPriceCHF: 44,
    savingsCHF: 13,
    // Cable car gondola cabin over snowy mountain peaks
    imageUrl: "https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: gletscherschluchtId,
    title: "Gletscherschlucht Grindelwald — gorge admission",
    partnerName: "Gletscherschlucht Grindelwald",
    category: "Activity",
    locationName: "Grindelwald",
    isEco: false,
    isActive: true,
    description: "Entry to the dramatic glacial gorge with 300m rock walls carved by the Lower Grindelwald Glacier",
    tokenCost: 5,
    discountPercentage: 17,
    originalPriceCHF: 12,
    savingsCHF: 2,
    // Turquoise glacial river flowing through narrow rocky gorge
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: trümmelbachId,
    title: "Trümmelbach glacier waterfalls — entry ticket",
    partnerName: "Trümmelbach Gletscherwasserfälle",
    category: "Activity",
    locationName: "Lauterbrunnen",
    isEco: true,
    isActive: true,
    description: "10 glacier waterfalls inside the mountain — Europe's largest subterranean falls up to 20,000 L/s",
    tokenCost: 6,
    discountPercentage: 8,
    originalPriceCHF: 14,
    savingsCHF: 1,
    // Powerful waterfall cascading inside a mountain cave
    imageUrl: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: aareschluchtId,
    title: "Aareschlucht gorge walk — adult ticket",
    partnerName: "Aareschlucht AG",
    category: "Activity",
    locationName: "Meiringen",
    isEco: true,
    isActive: true,
    description: "1.4 km walk through the spectacular Aare gorge up to 200m deep — turquoise water and dramatic rock formations",
    tokenCost: 5,
    discountPercentage: 20,
    originalPriceCHF: 11,
    savingsCHF: 2,
    // Deep narrow gorge with emerald green river and mossy walls
    imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: beatusId,
    title: "St. Beatus-Höhlen — stalactite cave tour",
    partnerName: "St. Beatus-Höhlen",
    category: "Activity",
    locationName: "Sundlauenen",
    isEco: true,
    isActive: true,
    description: "Guided tour through 1 km of stalactite caves above Lake Thun — underground waterfalls and cave museum included",
    tokenCost: 9,
    discountPercentage: 10,
    originalPriceCHF: 20,
    savingsCHF: 2,
    // Illuminated stalactite cave with glowing rock formations
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: ballenbergId,
    title: "Freilichtmuseum Ballenberg — full-day pass",
    partnerName: "Freilichtmuseum Ballenberg",
    category: "Activity",
    locationName: "Brienz",
    isEco: true,
    isActive: true,
    description: "Explore 100 authentic rural Swiss buildings on 66 hectares — Europe's largest open-air museum near Brienz",
    tokenCost: 12,
    discountPercentage: 25,
    originalPriceCHF: 32,
    savingsCHF: 8,
    // Traditional Swiss wooden chalet surrounded by green Alpine meadows
    imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: airGlaciersId,
    title: "Helicopter panorama flight — Jungfrau massif (30 min)",
    partnerName: "Air-Glaciers SA",
    category: "Activity",
    locationName: "Lauterbrunnen",
    isEco: false,
    isActive: true,
    description: "30-minute helicopter flight over the Jungfrau, Eiger and Mönch glaciers — the most breathtaking view in the Alps",
    tokenCost: 126,
    discountPercentage: 10,
    originalPriceCHF: 280,
    savingsCHF: 28,
    // Helicopter flying over white Alpine glacier from above
    imageUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: airGlaciersId,
    title: "Eiger north face helicopter tour (13 min)",
    partnerName: "Air-Glaciers SA",
    category: "Activity",
    locationName: "Lauterbrunnen",
    isEco: false,
    isActive: true,
    description: "13-minute aerial tour around the legendary north face of the Eiger — a legendary bucket-list experience",
    tokenCost: 63,
    discountPercentage: 10,
    originalPriceCHF: 140,
    savingsCHF: 14,
    // The Eiger's dramatic vertical granite north face against blue sky
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: grindelwaldSportsId,
    title: "Kleine Scheidegg–Männlichen — ski day pass",
    partnerName: "Grindelwald Sports",
    category: "Ski",
    locationName: "Grindelwald",
    isEco: false,
    isActive: true,
    description: "Full-day ski access to the Kleine Scheidegg–Männlichen area — 213 km of pistes with direct views of the Eiger north face",
    tokenCost: 29,
    discountPercentage: 25,
    originalPriceCHF: 78,
    savingsCHF: 20,
    // Skier carving through fresh powder on a sunny Alpine slope
    imageUrl: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=700&q=80",
  });

  await ctx.db.insert("offers", {
    partnerId: schwarzwaldalpId,
    title: "Zvieriplättli — Alpine snack platter",
    partnerName: "Chalet Schwarzwaldalp",
    category: "Restaurant",
    locationName: "Meiringen",
    isEco: true,
    isActive: true,
    description: "Traditional Swiss snack platter with local cheese, dried meats and bread at Chalet Schwarzwaldalp — weekdays 14:30–16:00",
    tokenCost: 6,
    discountPercentage: 33,
    originalPriceCHF: 18,
    savingsCHF: 6,
    // Rustic wooden board with Swiss cheese, charcuterie and fresh bread
    imageUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=700&q=80",
  });

  // ── 5 Activities (bookable experiences with duration) ─────────────────────────

  await ctx.db.insert("activities", {
    partnerId: jungfrauRailId,
    title: "Jungfraujoch — Top of Europe",
    description: "Ride the highest railway in Europe to 3,454 m — walk on the Aletsch glacier, visit the Ice Palace, and see 4,000m peaks in every direction",
    priceJF: 80,
    originalPriceCHF: 226,
    durationMinutes: 300,
    // Icy blue glacier plateau at high altitude with snowy peaks
    imageUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=80",
    isActive: true,
  });

  await ctx.db.insert("activities", {
    partnerId: airGlaciersId,
    title: "Tandem paragliding over Interlaken",
    description: "Soar over the turquoise lakes and Alpine valley with a certified pilot — 20-minute flight from Beatenberg with epic panorama",
    priceJF: 45,
    originalPriceCHF: 130,
    durationMinutes: 90,
    // Colorful paraglider soaring above a green valley with lakes below
    imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=700&q=80",
    isActive: true,
  });

  await ctx.db.insert("activities", {
    partnerId: trümmelbachId,
    title: "Boat cruise on Lake Brienz",
    description: "Scenic 1.5-hour cruise on the glacier-fed turquoise waters of Lake Brienz — passing waterfalls, cliffs and charming villages",
    priceJF: 12,
    originalPriceCHF: 35,
    durationMinutes: 90,
    // Turquoise alpine lake with emerald green water and mountain reflections
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80",
    isActive: true,
  });

  await ctx.db.insert("activities", {
    partnerId: maennlichenId,
    title: "Kleine Scheidegg summit hike",
    description: "Classic 3-hour ridge hike from Männlichen to Kleine Scheidegg with uninterrupted views of the Eiger, Mönch and Jungfrau the entire way",
    priceJF: 10,
    originalPriceCHF: 0,
    durationMinutes: 180,
    // Hiker walking on a mountain trail with dramatic snow-capped peaks behind
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=700&q=80",
    isActive: true,
  });

  await ctx.db.insert("activities", {
    partnerId: gletscherschluchtId,
    title: "Lauterbrunnen Valley waterfall walk",
    description: "Self-guided walk through the famous valley of 72 waterfalls — including Staubbach Falls and the hidden Trümmelbach cascade trails",
    priceJF: 5,
    originalPriceCHF: 12,
    durationMinutes: 120,
    // Lush green valley with towering white waterfalls cascading down sheer cliffs
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=80",
    isActive: true,
  });

  // ── Demo user: Alex, 1890 GT ────────────────────────────────────────────────

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
    partnerId: jungfrauRailId,
    tokensEarnedOrSpent: 600,
    type: "earn",
    amountLAKE: 600,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 7,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: maennlichenId,
    tokensEarnedOrSpent: -15,
    type: "spend",
    amountLAKE: 15,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 5,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: beatusId,
    tokensEarnedOrSpent: -9,
    type: "spend",
    amountLAKE: 9,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 3,
  });
  await ctx.db.insert("transactions", {
    userId,
    partnerId: aareschluchtId,
    tokensEarnedOrSpent: 1314,
    type: "earn",
    amountLAKE: 1314,
    txHash: generateTxHash(),
    timestamp: Date.now() - 86400000 * 1,
  });

  return { message: "Seeded: 1 user (Alex, 1890 GT), 10 real Jungfrau partners, 12 real offers, 4 transactions" };
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
