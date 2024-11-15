import { BaseChatModel } from "npm:@langchain/core/language_models/chat_models";
import { AIMessageChunk } from "npm:@langchain/core/messages";
import { Response } from "npm:express@4";

import { AuthenticatedRequest } from "../types/express.ts";
import { calculateCredits, deductCredits } from "./creditService.ts";
import { logUsage, updateUsageLog } from "./usageService.ts"; 
import { getTokenCount, getTokenCountFromMessageContent, getTokenEstimateOutputTokens } from "./tokenService.ts";
import { MODEL_MAP } from "../utils/models.ts";
import { PROMPTS } from "../utils/prompts.ts";

export async function optimizeText(
    text: string,
    languageCode: string,
    customPrompt: string,
    modelType: string,
    res: Response
) {
    const startTime = Date.now();
    const req = res.req as AuthenticatedRequest;
    const userId = req.user.id;
    let usageLogId: number | undefined;
    let inputTokens: number = 0;
    let outputTokens: number = 0;

    try {
        const modelConfig = MODEL_MAP[modelType];
        if (!modelConfig) {
            throw new Error(`Unknown model type: ${modelType}`);
        }

        const model = new modelConfig.class(modelConfig.config) as unknown as BaseChatModel;
        const prompt = PROMPTS[languageCode as keyof typeof PROMPTS] || PROMPTS.en;
        
        inputTokens = await getTokenCountFromMessageContent(modelConfig, { text, languageCode, customPrompt });

        // CREDIT: Calculate initial credits estimate
        const estimatedCredits = calculateCredits(modelType, {
            inputTokens,
            outputTokens: await getTokenEstimateOutputTokens(modelConfig, text)
        });
    
        // LOG: Create initial usage log
        usageLogId = await logUsage({
            userId,
            requestType: 'optimization',
            modelType,
            inputTokens,
            outputTokens: 0,
            creditsUsed: estimatedCredits,
            status: 'processing'
        });

        // Process the request
        const chain = prompt.pipe(model);
        const stream = await chain.stream({ text, languageCode, customPrompt });

        let fullResponse = '';
        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        const response = res as Response & { write(chunk: string): boolean; };
        const chunks: AIMessageChunk[] = [];
        for await (const chunk of stream) {
            if (chunk) {
                chunks.push(chunk);
                fullResponse += chunk.content;
                response.write(chunk.content);
            }
        }

        // CREDIT: Get final output tokens with fallback
        inputTokens = chunks[chunks.length - 1].usage_metadata?.input_tokens || inputTokens;
        outputTokens = chunks[chunks.length - 1].usage_metadata?.output_tokens || await getTokenCount(modelConfig, fullResponse);

        // CREDIT: Calculate actual credits used with accurate counts
        const actualCredits = calculateCredits(modelType, {
            inputTokens,
            outputTokens
        });
        
        // LOG: Update usage log with actual values
        await updateUsageLog(
            usageLogId,
            inputTokens,
            outputTokens,
            'completed',
            Date.now() - startTime,
            actualCredits
        );

        // CREDIT: Deduct actual credits used
        await deductCredits(userId, actualCredits, usageLogId);

        response.end();
    } catch (error) {
        console.error('Error:', error);
        
        // LOG: Update usage log if it was created
        if (usageLogId) {
            await updateUsageLog(
                usageLogId,
                inputTokens,
                outputTokens,
                'failed',
                Date.now() - startTime,
            );
        }

        res.status(500).json({ 
            error: 'An error occurred while processing your request.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 