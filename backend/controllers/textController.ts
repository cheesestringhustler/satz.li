import { Request, Response } from "npm:express@4";
import { optimizeText } from "../services/textService.ts";
import { detectLanguage } from "../services/languageService.ts";
import { AuthenticatedRequest } from "../types/express.ts";
import { validateAndPrepareOptimization, logOptimizationResult } from "../services/optimizationService.ts";
import { getTokenCountFromMessageContent } from "../services/tokenService.ts";
import { deductRequest } from "../services/requestsService.ts";
import { MODEL_MAP } from "../utils/models.ts";

export const optimizeTextHandler = async (req: Request, res: Response) => {
    const { text, languageCode, customPrompt, modelType } = req.body;
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;

    try {
        // Get model config and validate
        const modelConfig = MODEL_MAP[modelType];
        if (!modelConfig) {
            throw new Error(`Unknown model type: ${modelType}`);
        }

        // Get input tokens for validation
        const inputTokens = await getTokenCountFromMessageContent(modelConfig, { text, languageCode, customPrompt });

        // Validate request and prepare logging
        const usageLogId = await validateAndPrepareOptimization(userId, text, modelType, inputTokens);

        // Process the optimization
        const result = await optimizeText(text, languageCode, customPrompt, modelType, res);

        // Deduct one request after successful processing
        await deductRequest(userId, `text_optimization`);

        // Log the result
        await logOptimizationResult(usageLogId, result);

    } catch (error) {
        if (error instanceof Error && error.message === 'Insufficient requests') {
            return res.status(402).json({ error: error.message });
        }
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const detectLanguageHandler = async (req: Request, res: Response) => {
    const { text } = req.body;
    await detectLanguage(text, res);
}; 