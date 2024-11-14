export function calculateCredits(text: string, modelType: string): number {
    // Base rate per 1000 characters
    const baseRates: Record<string, number> = {
        'gpt-4o-mini': 1,
        'gpt-4o': 2,
        'claude-3-haiku': 1,
        'claude-3-5-sonnet': 3
    };

    const baseRate = baseRates[modelType] || 1;
    const charCount = text.length;
    
    // Calculate credits: 1 credit per 1000 characters (rounded up) * model rate
    return Math.ceil(charCount / 1000) * baseRate;
} 