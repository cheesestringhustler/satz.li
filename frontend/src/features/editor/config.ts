export interface RequestLimits {
    defaultMaxPromptChars: number;
    defaultMaxTextChars: number;
    defaultMaxContextChars: number;
    defaultRequestCost: number;
}

export const requestLimits: RequestLimits = {
    defaultMaxPromptChars: 148,
    defaultMaxTextChars: 4000,
    defaultMaxContextChars: 6000,
    defaultRequestCost: 1,
}; 