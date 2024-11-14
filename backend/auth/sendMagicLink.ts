import jwt from "npm:jsonwebtoken";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import sql from '../db/connection.ts';

const env = await load();
const isProduction = env.NODE_ENV === "production";
const JWT_SECRET = env.JWT_SECRET;

export async function sendMagicLink(email: string) {
    // Generate a temporary token that expires in 15 minutes
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store the magic link token
    await sql`
        INSERT INTO magic_link_tokens (token, email, expires_at)
        VALUES (${token}, ${email}, ${expiresAt})
    `;
    
    const magicLink = `${isProduction ? "https://satz.li" : "http://localhost:5173"}/a/verify?token=${token}`;
    console.log(`Magic link for ${email}: ${magicLink}`);
    
    return true;
} 