import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// CA SoS scraper - runs daily at 6:00 AM PT
// 9 AM UTC = 6 AM PT (winter) / 2 AM PT (summer)
crons.cron(
  "scrape-ca-sos",
  "0 9 * * *",
  internal.jobs.index.scrapeCaSos,
  {}
);

// Santa Clara scraper - runs daily at 6:05 AM PT
crons.cron(
  "scrape-santa-clara",
  "5 9 * * *",
  internal.jobs.index.scrapeSantaClara,
  {}
);

export default crons;
