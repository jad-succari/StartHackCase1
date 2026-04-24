import { mutation } from "./_generated/server";

export const populateData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingUser = await ctx.db.query("users").first();
    if (existingUser) {
      return { message: "Data already populated" };
    }

    await ctx.db.insert("users", {
      isTourist: true,
      name: "Visiteur Hackathon",
      email: "test@hackathon.com",
      greenTokensBalance: 150,
    });

    const railwaysId = await ctx.db.insert("partners", {
      name: "Jungfrau Railways",
      type: "transport",
      location: "Grindelwald, CH",
    });

    const restaurantId = await ctx.db.insert("partners", {
      name: "Restaurant des Alpes",
      type: "activity",
      location: "Interlaken, CH",
    });

    await ctx.db.insert("offers", {
      partnerId: railwaysId,
      title: "Montée au Jungfraujoch",
      description: "Billet aller-retour offert pour le Sommet de l'Europe",
      tokenCost: 80,
      discountPercentage: 100,
    });

    await ctx.db.insert("offers", {
      partnerId: restaurantId,
      title: "10% sur la fondue",
      description: "Réduction sur votre fondue traditionnelle suisse",
      tokenCost: 20,
      discountPercentage: 10,
    });

    await ctx.db.insert("offers", {
      partnerId: railwaysId,
      title: "Demi-tarif régional",
      description: "Voyagez à moitié prix sur tout le réseau Jungfrau",
      tokenCost: 40,
      discountPercentage: 50,
    });

    return { message: "Data populated successfully" };
  },
});
