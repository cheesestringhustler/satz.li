import postgres from "npm:postgres";
import { config } from "../config/index.ts";

const sql = postgres({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    username: config.database.username,
    password: config.database.password,
});

export default sql; 