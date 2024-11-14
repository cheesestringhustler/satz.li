import jwt from "npm:jsonwebtoken";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();
const isProduction = env.NODE_ENV === "production";
const JWT_SECRET = env.JWT_SECRET;

export async function sendMagicLink(email: string) {
    // Generate a temporary token that expires in 15 minutes
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    
    // In a real application, you would send this link via email
    // For now, we'll just console.log it
    const magicLink = `${isProduction ? "https://satz.li" : "http://localhost:5173"}/a/verify?token=${token}`;
    console.log(`Magic link for ${email}: ${magicLink}`);
    
    // TODO: Implement actual email sending logic
    return true;
} 