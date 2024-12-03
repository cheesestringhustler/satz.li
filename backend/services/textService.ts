import { BaseChatModel } from "npm:@langchain/core/language_models/chat_models";
import { AIMessageChunk } from "npm:@langchain/core/messages";
import { Response } from "npm:express@4";

import { AuthenticatedRequest } from "../types/express.ts";
import { getTokenCount, getTokenCountFromMessageContent } from "./tokenService.ts";
import { MODEL_MAP } from "../utils/models.ts";
import { PROMPTS } from "../utils/prompts.ts";

export interface OptimizationResult {
    text: string;
    inputTokens: number;
    outputTokens: number;
    responseTime: number;
}

export async function optimizeText(
    text: string,
    languageCode: string,
    customPrompt: string,
    modelType: string,
    res: Response
): Promise<OptimizationResult | null> {
    const startTime = Date.now();
    const req = res.req as AuthenticatedRequest;
    const userId = req.user.id;
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

        // Get final token counts with fallback
        inputTokens = chunks[chunks.length - 1].usage_metadata?.input_tokens || inputTokens;
        outputTokens = chunks[chunks.length - 1].usage_metadata?.output_tokens || await getTokenCount(modelConfig, fullResponse);

        response.end();

        return {
            text: fullResponse,
            inputTokens,
            outputTokens,
            responseTime: Date.now() - startTime
        };
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
        return null;
    }
} 