import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

const maxJWTTokenAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const config = {
    jwt: {
        secret: env.JWT_SECRET,
        maxAge: maxJWTTokenAge,
    },
    environment: {
        isProduction: env.NODE_ENV === "production",
        port: 3000,
        frontendUrl: env.FRONTEND_URL
    },
    cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: 'strict' as const,
        maxAge: maxJWTTokenAge,
        path: '/'
    },
    database: {
        host: env.POSTGRES_HOST,
        port: Number(env.POSTGRES_PORT),
        database: env.POSTGRES_DB,
        username: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
    },
    ai: {
        anthropicApiKey: env.ANTHROPIC_API_KEY,
        openaiApiKey: env.OPENAI_API_KEY
    },
    stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        publicKey: env.STRIPE_PUBLIC_KEY
    },
    brevo: {
        apiKey: env.BREVO_API_KEY,
        fromEmail: env.BREVO_FROM_EMAIL
    }
}; 
