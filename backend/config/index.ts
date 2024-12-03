const maxJWTTokenAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const maxMagicLinkTokenAge = 15 * 60 * 1000; // 15 minutes in milliseconds

export const config = {
    jwt: {
        secret: Deno.env.get("JWT_SECRET") || "",
        maxAge: maxJWTTokenAge,
        magicLinkMaxAge: maxMagicLinkTokenAge
    },
    environment: {
        isProduction: Deno.env.get("ENV") === "production",
        port: 3000,
        domain: Deno.env.get("DOMAIN") || ""
    },
    cookie: {
        httpOnly: true,
        secure: Deno.env.get("ENV") === "production",
        sameSite: 'strict' as const,
        maxAge: maxJWTTokenAge,
        path: '/'
    },
    database: {
        host: Deno.env.get("POSTGRES_HOST") || "",
        port: Number(Deno.env.get("POSTGRES_PORT")) || 5432,
        database: Deno.env.get("POSTGRES_DB") || "",
        username: Deno.env.get("POSTGRES_USER") || "",
        password: Deno.env.get("POSTGRES_PASSWORD") || "",
        searchPath: ['app', 'public'],
    },
    ai: {
        anthropicApiKey: Deno.env.get("ANTHROPIC_API_KEY") || "",
        openaiApiKey: Deno.env.get("OPENAI_API_KEY") || ""
    },
    stripe: {
        secretKey: Deno.env.get("STRIPE_SECRET_KEY") || "",
        webhookSecret: Deno.env.get("STRIPE_WEBHOOK_SECRET") || "", 
        publicKey: Deno.env.get("STRIPE_PUBLIC_KEY") || ""
    },
    brevo: {
        apiKey: Deno.env.get("BREVO_API_KEY") || "",
        fromEmail: Deno.env.get("BREVO_FROM_EMAIL") || ""
    },
    credits: {
        tier1Credits: 250,
        tier1Price: 5,
        defaultBalance: 1000,
        baseDecimalMultiplier: 1000000,
    },
    requestLimits: {
        newUserRequestsBalance: 10,
        defaultMaxPromptChars: 120,
        defaultMaxTextChars: 4000,
        defaultMaxContextChars: 6000,
        defaultRequestCost: 1,
    }
}; 
