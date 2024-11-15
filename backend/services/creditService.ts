import sql from "../db/connection.ts";
import { MODEL_MAP } from "../utils/models.ts";

const BASE_DECIMAL_MULTIPLIER = 1000000;

type TokenCount = {
    inputTokens: number;
    outputTokens: number;
};

export async function getCreditsBalance(userId: number): Promise<number> {
    const result = await sql`SELECT credits_balance FROM users WHERE id = ${userId}`;
    return result[0].credits_balance;
}

export function calculateCredits(modelType: string, { inputTokens, outputTokens }: TokenCount): number {
    const model = MODEL_MAP[modelType];
    if (!model) {
        throw new Error(`Unknown model type: ${modelType}`);
    }

    const inputCost = (inputTokens / 1000) * model.rates.inputRate;
    const outputCost = (outputTokens / 1000) * model.rates.outputRate;
    
    const totalCost = inputCost + outputCost;
    const totalCostMultiplied = totalCost * BASE_DECIMAL_MULTIPLIER;
    
    return Math.ceil(totalCostMultiplied);
}

export async function deductCredits(userId: number, creditsUsed: number, referenceId: number): Promise<number> {
    const result = await sql.begin(async (sql) => {
        // Deduct credits from user balance
        const result = await sql`
            UPDATE users 
            SET credits_balance = credits_balance - ${creditsUsed}
            WHERE id = ${userId}
            AND credits_balance >= ${creditsUsed}
            RETURNING credits_balance
        `;

        if (result.length === 0) {
            throw new Error('Insufficient credits');
        }

        // Log the transaction
        await sql`
            INSERT INTO credits_transactions (
                user_id,
                amount,
                transaction_type,
                reference_id
            ) VALUES (
                ${userId},
                ${-creditsUsed},
                'usage',
                ${referenceId}
            )
        `;
        return result[0].credits_balance;
    });
    return result;
}