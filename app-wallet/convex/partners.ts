import { query } from "./_generated/server";

export const getPartners = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    const offers = await ctx.db.query("offers").collect();
    return partners.map((p) => ({
      ...p,
      offers: offers.filter((o) => o.partnerId === p._id),
    }));
  },
});
