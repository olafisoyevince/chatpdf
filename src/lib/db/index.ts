import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// to cache the connection that is being set
neonConfig.fetchConnectionCache = true;

// if database url does not exist, thow an error
if (!process.env.DATABASE_URL) {
  throw new Error("database url not found");
}

// creating the sql server and connecting it to neon database
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);
