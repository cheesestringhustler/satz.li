const maxJWTTokenAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const config = {
    jwt: {
        secret: Deno.env.get("JWT_SECRET"),
        maxAge: maxJWTTokenAge,
    },
    environment: {
        isProduction: Deno.env.get("ENV") === "production",
        port: 3000
    },
    cookie: {
        httpOnly: true,
        secure: Deno.env.get("ENV") === "production",
        sameSite: 'strict' as const,
        maxAge: maxJWTTokenAge,
        path: '/'
    },
    database: {
        host: Deno.env.get("POSTGRES_HOST"),
        port: Number(Deno.env.get("POSTGRES_PORT")),
        database: Deno.env.get("POSTGRES_DB"),
        username: Deno.env.get("POSTGRES_USER"),
        password: Deno.env.get("POSTGRES_PASSWORD"),
        searchPath: ['app', 'public'],
    },
    ai: {
        anthropicApiKey: Deno.env.get("ANTHROPIC_API_KEY"),
        openaiApiKey: Deno.env.get("OPENAI_API_KEY")
    }
};