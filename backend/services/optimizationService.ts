import { config } from "../config/index.ts";
import { logUsage, updateUsageLog } from "./usageService.ts";
import { checkCreditsAvailability } from "./creditsService.ts";
import type { OptimizationResult } from "./textService.ts";

interface OptimizationLogResult {
    usageLogId: number;
    success: boolean;
}

export async function validateAndPrepareOptimization(
    userId: number,
    text: string,
    customPrompt: string,
    modelType: string,
    inputTokens: number
): Promise<number> {
    // Check if user has available requests
    const isAvailable = await checkCreditsAvailability(userId);
    if (!isAvailable) {
        throw new Error('Insufficient requests');
    }

    // Check text length (assuming there's a character limit)
    if (text.length > config.requestLimits.defaultMaxTextChars) {
        throw new Error('Text too long');
    }

    // Check custom prompt length
    if (customPrompt.length > config.requestLimits.defaultMaxPromptChars) {
        throw new Error('Custom prompt too long');
    }

    // Create initial usage log
    const usageLogId = await logUsage({
        userId,
        requestType: 'text_optimization',
        modelType,
        inputTokens,
        outputTokens: 0,
        creditsUsed: 0,
        status: 'processing'
    });

    return usageLogId;
}

export async function logOptimizationResult(
    usageLogId: number,
    result: OptimizationResult | null
): Promise<OptimizationLogResult> {
    if (!result) {
        await updateUsageLog(
            usageLogId,
            0,
            0,
            'failed',
            0,
            0
        );
        return { usageLogId, success: false };
    }

    await updateUsageLog(
        usageLogId,
        result.inputTokens,
        result.outputTokens,
        'completed',
        result.responseTime,
        1
    );

    return { usageLogId, success: true };
} 