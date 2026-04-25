import { mutation } from "./_generated/server";

export const populateData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingUser = await ctx.db.query("users").first();
    if (existingUser) {
      return { message: "Data already populated" };
    }

    await ctx.db.insert("users", {
      name: "Alex Schmidt",
      email: "alex@test.com",
      role: "tourist",
      greenTokensBalance: 500,
      passSerialNumber: "PSN-001",
    });

    await ctx.db.insert("users", {
      name: "Jungfrau Partner",
      email: "partner@jungfrau.com",
      role: "partner",
      greenTokensBalance: 0,
      passSerialNumber: "PSN-002",
    });

    const jungfraubahnId = await ctx.db.insert("partners", {
      name: "Jungfraubahn",
      type: "transport",
      description: "The train to the Top of Europe at 3,454 m altitude",
      village: "Interlaken",
      latitude: 46.6863,
      longitude: 7.8632,
      isEcoCertified: true,
      isActive: true,
    });

    const harderKulmId = await ctx.db.insert("partners", {
      name: "Harder Kulm",
      type: "activity",
      description: "Exceptional panorama over Lake Thun and Lake Brienz from 1,322 m",
      village: "Interlaken",
      latitude: 46.7003,
      longitude: 7.8694,
      isEcoCertified: true,
      isActive: true,
    });

    const grindelwaldId = await ctx.db.insert("partners", {
      name: "Grindelwald Ski Resort",
      type: "ski",
      description: "Ski resort at the foot of the Eiger with 213 km of marked slopes",
      village: "Grindelwald",
      latitude: 46.6245,
      longitude: 8.0411,
      isEcoCertified: true,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: jungfraubahnId,
      title: "Jungfraujoch Ascent",
      description:
        "Round-trip rack railway ticket to Jungfraujoch at 3,454 m, panoramic view of the Aletsch Glacier",
      priceJF: 180,
      originalPriceCHF: 232,
      durationMinutes: 240,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: harderKulmId,
      title: "Harder Kulm Panorama",
      description:
        "Cable car to the Two Lakes Bridge terrace at 1,322 m, 360° view over Interlaken and the Alps",
      priceJF: 35,
      originalPriceCHF: 44,
      durationMinutes: 90,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: grindelwaldId,
      title: "Grindelwald Ski Day",
      description:
        "Full-day pass with unlimited access to Grindelwald–Wengen lifts, 213 km of slopes",
      priceJF: 75,
      originalPriceCHF: 95,
      durationMinutes: 480,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: jungfraubahnId,
      title: "Lauterbrunnen Valley Tour",
      description:
        "Guided excursion through the valley of 72 waterfalls, departing from Interlaken by panoramic train",
      priceJF: 45,
      originalPriceCHF: 58,
      durationMinutes: 180,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: grindelwaldId,
      title: "Glacier Excursion",
      description:
        "Guided hike on the Grindelwald glacier with a certified guide, equipment provided",
      priceJF: 60,
      originalPriceCHF: 77,
      durationMinutes: 300,
      isActive: true,
    });

    return { message: "Data populated successfully" };
  },
});
