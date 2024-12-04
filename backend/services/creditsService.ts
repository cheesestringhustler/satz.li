import { config } from "../config/index.ts";
import sql from "../db/connection.ts";

export async function getCreditsBalance(userId: number): Promise<number> {
    const result = await sql`SELECT credits_balance FROM users WHERE id = ${userId}`;
    return result[0].credits_balance;
}

export async function checkCreditsAvailability(userId: number): Promise<boolean> {
    // Get user's current request balance
    const creditsBalance = await getCreditsBalance(userId);

    // Check if user has any requests available
    if (creditsBalance <= 0) {
        return false;
    }

    return true;
}

export async function deductCredits(userId: number, referenceId: string): Promise<number> {
    const result = await sql.begin(async (sql) => {
        // Deduct request from user balance
        const result = await sql`
            UPDATE users 
            SET credits_balance = credits_balance - ${config.requestLimits.defaultRequestCost}
            WHERE id = ${userId}
            AND credits_balance > 0
            RETURNING credits_balance
        `;

        if (result.length === 0) {
            throw new Error('No credits available');
        }

        // Log the transaction
        await sql`
            INSERT INTO credits_transactions (
                user_id,
                amount,
                transaction_type,
                reference_id,
                notes
            ) VALUES (
                ${userId},
                ${-config.requestLimits.defaultRequestCost},
                'user_usage',
                ${referenceId},
                'Text optimization'
            )
        `;

        return result[0].credits_balance;
    });

    return result;
}

export async function hasUserPurchasedCredits(userId: number): Promise<boolean> {
    const result = await sql`
        SELECT stripe_customer_id
        FROM users
        WHERE id = ${userId}
    `;
    return result[0]?.stripe_customer_id != null;
}