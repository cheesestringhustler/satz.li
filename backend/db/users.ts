import sql from './connection.ts';
import jwt from 'npm:jsonwebtoken';

export async function createOrGetUser(email: string) {
    // Try to find existing user
    let user = await sql`
        SELECT id, email, credits_balance 
        FROM users 
        WHERE email = ${email}
    `;

    if (user.length === 0) {
        // Create new user if doesn't exist
        user = await sql`
            INSERT INTO users (email, credits_balance)
            VALUES (${email}, 100)
            RETURNING id, email, credits_balance
        `;
    }

    return user[0];
}

export async function storeJWTToken(userId: number, token: string, expiresAt: Date) {
    await sql`
        INSERT INTO jwt_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
    `;
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

export async function createUserSession(email: string, token: string, jwtSecret: string) {
    // Mark the magic link token as used
    await sql`
        UPDATE magic_link_tokens
        SET used = true
        WHERE token = ${token}
    `;
    
    // Create or get user
    const user = await createOrGetUser(email);
    
    // Generate new access token
    const accessToken = jwt.sign(
        { 
            userId: user.id,
            email: user.email 
        }, 
        jwtSecret, 
        { expiresIn: '15m' }
    );
    
    // Store access token in database
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await storeJWTToken(user.id, accessToken, expiresAt);

    return { user, accessToken };
}