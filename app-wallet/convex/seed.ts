import { mutation } from "./_generated/server";

export const populateData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingUser = await ctx.db.query("users").first();
    if (existingUser) {
      return { message: "Data already populated" };
    }

    // 2 utilisateurs
    await ctx.db.insert("users", {
      name: "Alex Schmidt",
      email: "alex@test.com",
      role: "tourist",
      jfBalance: 500,
      passSerialNumber: "PSN-001",
    });

    await ctx.db.insert("users", {
      name: "Jungfrau Partner",
      email: "partner@jungfrau.com",
      role: "partner",
      jfBalance: 0,
      passSerialNumber: "PSN-002",
    });

    // 3 partenaires réels de la région
    const jungfraubahnId = await ctx.db.insert("partners", {
      name: "Jungfraubahn",
      type: "transport",
      description: "Le train vers le Sommet de l'Europe à 3454m d'altitude",
      village: "Interlaken",
      latitude: 46.6863,
      longitude: 7.8632,
      isEcoCertified: true,
      isActive: true,
    });

    const harderKulmId = await ctx.db.insert("partners", {
      name: "Harder Kulm",
      type: "activity",
      description:
        "Panorama exceptionnel sur les lacs de Thoune et Brienz depuis 1322m",
      village: "Interlaken",
      latitude: 46.7003,
      longitude: 7.8694,
      isEcoCertified: true,
      isActive: true,
    });

    const grindelwaldId = await ctx.db.insert("partners", {
      name: "Grindelwald Ski Resort",
      type: "ski",
      description:
        "Station de ski au pied de l'Eiger avec 213km de pistes balisées",
      village: "Grindelwald",
      latitude: 46.6245,
      longitude: 8.0411,
      isEcoCertified: true,
      isActive: true,
    });

    // 5 activités avec prix JF et prix original CHF
    await ctx.db.insert("activities", {
      partnerId: jungfraubahnId,
      title: "Montée Jungfraujoch",
      description:
        "Billet aller-retour en train à crémaillère jusqu'au Jungfraujoch à 3454m, vue panoramique sur l'Aletschgletscher",
      priceJF: 180,
      originalPriceCHF: 232,
      durationMinutes: 240,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: harderKulmId,
      title: "Panorama Harder Kulm",
      description:
        "Télécabine jusqu'à la terrasse Two Lakes Bridge à 1322m, vue à 360° sur Interlaken et les Alpes",
      priceJF: 35,
      originalPriceCHF: 44,
      durationMinutes: 90,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: grindelwaldId,
      title: "Journée ski Grindelwald",
      description:
        "Forfait journée avec accès illimité aux remontées mécaniques Grindelwald–Wengen, 213km de pistes",
      priceJF: 75,
      originalPriceCHF: 95,
      durationMinutes: 480,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: jungfraubahnId,
      title: "Tour vallée Lauterbrunnen",
      description:
        "Excursion guidée dans la vallée des 72 cascades, départ depuis Interlaken en train panoramique",
      priceJF: 45,
      originalPriceCHF: 58,
      durationMinutes: 180,
      isActive: true,
    });

    await ctx.db.insert("activities", {
      partnerId: grindelwaldId,
      title: "Excursion Glacier",
      description:
        "Randonnée sur le glacier de Grindelwald avec guide certifié, équipement fourni",
      priceJF: 60,
      originalPriceCHF: 77,
      durationMinutes: 300,
      isActive: true,
    });

    return { message: "Data populated successfully" };
  },
});
