import { Request, Response } from "npm:express@4";
import { AuthenticatedRequest } from "../types/express.ts";
import { MODEL_MAP, } from "../utils/models.ts";
import { getCreditsBalance, calculateCredits } from "../services/creditService.ts";
import { getTokenCountFromMessageContent, getTokenEstimateOutputTokens } from "../services/tokenService.ts";

export const getCreditsBalanceHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const creditsBalance = await getCreditsBalance(userId);
    res.json({ creditsBalance });
};

export const getCreditsEstimateHandler = async (req: Request, res: Response) => {
    const { text, languageCode, customPrompt, modelType } = req.body;

    const model = MODEL_MAP[modelType];
    if (!model) {
        throw new Error(`Unknown model type: ${modelType}`);
    }

    const inputTokens = await getTokenCountFromMessageContent(model, { text, languageCode, customPrompt });
    const outputTokens = await getTokenEstimateOutputTokens(model, text);

    const estimatedCredits = calculateCredits(modelType, { inputTokens, outputTokens });
    res.json({ creditsEstimate: estimatedCredits });
};