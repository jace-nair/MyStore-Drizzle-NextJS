import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";
import env from "@/lib/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// TODO: logger true

export const db = drizzle(pool, { schema });

export type DB = typeof db;

/*

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import env from "@/lib/env";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql });
export type DB = typeof db;

*/
