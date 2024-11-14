import postgres from "npm:postgres";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

const sql = postgres({
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT),
  database: env.POSTGRES_DB,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
});

export default sql; 