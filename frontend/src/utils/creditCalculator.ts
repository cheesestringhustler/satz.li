export function calculateCredits(text: string, modelType: string): number {

    // TODO: Move to backend
    const MODEL_RATES = {
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

    const rates = MODEL_RATES[modelType as keyof typeof MODEL_RATES];
    if (!rates) {
        throw new Error(`Unknown model type: ${modelType}`);
    }

    // For frontend estimation, assume output tokens will be similar to input
    const estimatedTokens = text.length / 4; // Rough estimate of tokens from characters
    const inputCost = (estimatedTokens / 1000) * rates.inputRate;
    const outputCost = (estimatedTokens / 1000) * rates.outputRate;

    const totalCost = inputCost + outputCost;
    const totalCostMultiplied = totalCost * 1000000;

    return Math.ceil(totalCostMultiplied);
}