import jwt from "npm:jsonwebtoken";
import sql from "../db/connection.ts";
import { config } from "../config/index.ts";
import { generateMagicLinkEmail, sendEmail } from "./emailService.ts";

export async function createOrGetUser(email: string) {
    let user = await sql`
        SELECT id, email, credits_balance 
        FROM users 
        WHERE email = ${email}
    `;

    if (user.length === 0) {
        user = await sql`
            INSERT INTO users (email, credits_balance)
            VALUES (${email}, ${config.requestLimits.newUserRequestsBalance})
            RETURNING id, email, credits_balance
        `;
    }

    return user[0];
}

export async function validateToken(token: string) {
    const result = await sql`
        SELECT u.id, u.email, u.credits_balance
        FROM jwt_tokens t
        JOIN users u ON t.user_id = u.id
        WHERE t.token = ${token}
        AND t.expires_at > CURRENT_TIMESTAMP
        AND NOT t.revoked
    `;

    return result[0] || null;
}

export async function revokeToken(token: string) {
    await sql`
        UPDATE jwt_tokens
        SET revoked = true
        WHERE token = ${token}
    `;
}

export async function validateMagicLinkToken(token: string): Promise<boolean> {
    const magicToken = await sql`
        SELECT * FROM magic_link_tokens
        WHERE token = ${token}
        AND NOT used
        AND expires_at > CURRENT_TIMESTAMP
    `;
    return magicToken.length > 0;
}

export async function sendMagicLink(email: string) {
    const token = jwt.sign(
        { email },
        config.jwt.secret,
        { expiresIn: config.jwt.magicLinkMaxAge / 1000 },
    );
    const expiresAt = new Date(Date.now() + config.jwt.magicLinkMaxAge);

    await sql`
        INSERT INTO magic_link_tokens (token, email, expires_at)
        VALUES (${token}, ${email}, ${expiresAt})
    `;

    const magicLink = `${
        config.environment.isProduction ? "https" : "http"
    }://${config.environment.domain}/a/verify?token=${token}`;

    const { subject, htmlContent } = generateMagicLinkEmail(email, magicLink);

    try {
        if (config.environment.isProduction) {
            await sendEmail({
                to: email,
                subject,
                htmlContent,
            });
        } else {
            console.log(`Magic link for ${email}:\n${magicLink}`);
        }
        return true;
    } catch (error) {
        console.error("Failed to send magic link email:", error);
        throw new Error("Failed to send magic link email");
    }
}

export async function createUserSession(email: string, token: string) {
    await sql`
        UPDATE magic_link_tokens
        SET used = true
        WHERE token = ${token}
    `;

    const user = await createOrGetUser(email);

    const accessToken = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.maxAge / 1000 }, // Convert to seconds for JWT
    );

    const expiresAt = new Date(Date.now() + config.jwt.maxAge);
    await storeJWTToken(user.id, accessToken, expiresAt);

    return { user, accessToken };
}

async function storeJWTToken(userId: number, token: string, expiresAt: Date) {
    await sql`
        INSERT INTO jwt_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
    `;
}

export async function refreshToken(userId: number, email: string) {
    const newAccessToken = jwt.sign(
        { userId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.maxAge / 1000 }, // Convert to seconds for JWT
    );

    const expiresAt = new Date(Date.now() + config.jwt.maxAge);
    await storeJWTToken(userId, newAccessToken, expiresAt);

    return newAccessToken;
}
