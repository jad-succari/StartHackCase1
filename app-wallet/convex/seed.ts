import { mutation } from "./_generated/server";

export const resetOffers = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing offers
    const existing = await ctx.db.query("offers").collect();
    for (const o of existing) {
      await ctx.db.delete(o._id);
    }

    const partners = await ctx.db.query("partners").collect();
    const jungfraubahn = partners.find((p) => p.name === "Jungfraubahn");
    const harderKulm = partners.find((p) => p.name === "Harder Kulm");
    const grindelwald = partners.find((p) => p.name === "Grindelwald Ski Resort");

    if (!jungfraubahn || !harderKulm || !grindelwald) {
      return { message: "Partners not found, run populateData first" };
    }

    await ctx.db.insert("offers", {
      partnerId: jungfraubahn._id,
      title: "Montée au Jungfraujoch",
      description: "Billet aller-retour offert pour le Sommet de l'Europe",
      tokenCost: 80,
      isActive: true,
      imageUrl: "https://picsum.photos/seed/jungfrau/800/600",
    });

    await ctx.db.insert("offers", {
      partnerId: harderKulm._id,
      title: "10% sur la fondue",
      description: "Réduction sur votre fondue traditionnelle suisse",
      tokenCost: 20,
      isActive: true,
      imageUrl: "https://picsum.photos/seed/fondue/800/600",
    });

    await ctx.db.insert("offers", {
      partnerId: grindelwald._id,
      title: "Demi-tarif régional",
      description: "Voyagez à moitié prix sur tout le réseau Jungfrau",
      tokenCost: 40,
      isActive: true,
      imageUrl: "https://picsum.photos/seed/grindelwald/800/600",
    });

    return { message: "Offers reset successfully" };
  },
});

export const populateData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPartner = await ctx.db.query("partners").first();
    if (existingPartner) {
      return { message: "Data already populated" };
    }

    await ctx.db.insert("users", {
      name: "Alex Demo",
      email: "alex@demo.com",
      role: "tourist",
      greenTokensBalance: 500,
      referralCode: "DEMO42",
      isActivated: true,
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
      description: "Round-trip rack railway ticket to Jungfraujoch at 3,454 m, panoramic view of the Aletsch Glacier",
      priceJF: 180,
      originalPriceCHF: 232,
      durationMinutes: 240,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: harderKulmId,
      title: "Harder Kulm Panorama",
      description: "Cable car to the Two Lakes Bridge terrace at 1,322 m, 360° view over Interlaken and the Alps",
      priceJF: 35,
      originalPriceCHF: 44,
      durationMinutes: 90,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: grindelwaldId,
      title: "Grindelwald Ski Day",
      description: "Full-day pass with unlimited access to Grindelwald–Wengen lifts, 213 km of slopes",
      priceJF: 75,
      originalPriceCHF: 95,
      durationMinutes: 480,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: jungfraubahnId,
      title: "Lauterbrunnen Valley Tour",
      description: "Guided excursion through the valley of 72 waterfalls, departing from Interlaken by panoramic train",
      priceJF: 45,
      originalPriceCHF: 58,
      durationMinutes: 180,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: grindelwaldId,
      title: "Glacier Excursion",
      description: "Guided hike on the Grindelwald glacier with a certified guide, equipment provided",
      priceJF: 60,
      originalPriceCHF: 77,
      durationMinutes: 300,
      isActive: true,
    });

    await ctx.db.insert("offers", {
      partnerId: jungfraubahnId,
      title: "Jungfraujoch Summit Pass",
      description: "Round-trip train ticket to the Top of Europe at 3,454 m. Panoramic view of the Aletsch Glacier.",
      tokenCost: 180,
      originalPriceCHF: 232,
      isActive: true,
      discountPercentage: 22,
    });

    await ctx.db.insert("offers", {
      partnerId: harderKulmId,
      title: "Harder Kulm Panorama",
      description: "Cable car to the Two Lakes Bridge terrace at 1,322 m. 360° view over Interlaken and the Alps.",
      tokenCost: 35,
      originalPriceCHF: 44,
      isActive: true,
      discountPercentage: 20,
    });

    await ctx.db.insert("offers", {
      partnerId: grindelwaldId,
      title: "Grindelwald Full-Day Ski Pass",
      description: "Unlimited access to Grindelwald–Wengen lifts across 213 km of slopes.",
      tokenCost: 75,
      originalPriceCHF: 95,
      isActive: true,
      discountPercentage: 21,
    });

    await ctx.db.insert("offers", {
      partnerId: jungfraubahnId,
      title: "Lauterbrunnen Valley Tour",
      description: "Guided excursion through the valley of 72 waterfalls by panoramic train.",
      tokenCost: 45,
      originalPriceCHF: 58,
      isActive: true,
      discountPercentage: 22,
    });

    await ctx.db.insert("offers", {
      partnerId: grindelwaldId,
      title: "Glacier Hike with Guide",
      description: "Certified guide-led hike on the Grindelwald glacier. Equipment included.",
      tokenCost: 60,
      originalPriceCHF: 77,
      isActive: true,
      discountPercentage: 22,
    });

    return { message: "Data populated successfully" };
  },
});
