import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

export const config = {
    jwt: {
        secret: env.JWT_SECRET,
    },
    environment: {
        isProduction: env.NODE_ENV === "production",
        port: 3000
    },
    cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: 'strict' as const,
        maxAge: 15 * 60 * 1000,
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
    }
}; 