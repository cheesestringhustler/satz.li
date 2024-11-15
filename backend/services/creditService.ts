import sql from "../db/connection.ts";

type TokenCount = {
    inputTokens: number;
    outputTokens: number;
};

type ModelRates = {
    inputRate: number;
    outputRate: number;
};

const MODEL_RATES: Record<string, ModelRates> = {
    'claude-3-haiku': {
        inputRate: 0.000250,  // Credits per 1K input tokens
        outputRate: 0.001250  // Credits per 1K output tokens
    },
    'claude-3-5-sonnet': {
        inputRate: 0.003000,
        outputRate: 0.015000
    },
    'gpt-4o-mini': {
        inputRate: 0.000150,
        outputRate: 0.000600
    },
    'gpt-4o': {
        inputRate: 0.002500,
        outputRate: 0.010000
    }
};

export function getModelRates(modelType: string): ModelRates {
    return MODEL_RATES[modelType];
}

export async function getCreditsBalance(userId: number): Promise<number> {
    const result = await sql`SELECT credits_balance FROM users WHERE id = ${userId}`;
    return result[0].credits_balance;
}

export function calculateCredits(modelType: string, { inputTokens, outputTokens }: TokenCount): number {
    const rates = getModelRates(modelType);
    if (!rates) {
        throw new Error(`Unknown model type: ${modelType}`);
    }

    const inputCost = (inputTokens / 1000) * rates.inputRate;
    const outputCost = (outputTokens / 1000) * rates.outputRate;
    console.log('tokens', inputTokens, outputTokens);
    console.log('Math.ceil(inputCost + outputCost)', Math.ceil(inputCost + outputCost));
    return Math.ceil(inputCost + outputCost);
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