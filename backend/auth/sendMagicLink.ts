import jwt from "npm:jsonwebtoken";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key";

export async function sendMagicLink(email: string) {
    // Generate a temporary token that expires in 15 minutes
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    
    // In a real application, you would send this link via email
    // For now, we'll just console.log it
    const magicLink = `http://localhost:3000/verify?token=${token}`;
    console.log(`Magic link for ${email}: ${magicLink}`);
    
    // TODO: Implement actual email sending logic
    return true;
} 