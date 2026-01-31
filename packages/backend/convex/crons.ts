import { cron } from "./_generated/server";

// CA SoS scraper - runs daily at 6:00 AM PT
// 9 AM UTC = 6 AM PT (winter) / 2 AM PT (summer)
cron({
  name: "scrape-ca-sos",
  schedule: "0 9 * * *",
  handler: async (ctx) => {
    await ctx.runAction(api.jobs.scrapeCaSos, {});
  },
});

// Santa Clara scraper - runs daily at 6:05 AM PT
cron({
  name: "scrape-santa-clara",
  schedule: "5 9 * * *",
  handler: async (ctx) => {
    await ctx.runAction(api.jobs.scrapeSantaClara, {});
  },
});
