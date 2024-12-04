import { Request, Response } from "npm:express@4";
import { AuthenticatedRequest } from "../types/express.ts";
import { getCreditsBalance, checkCreditsAvailability, hasUserPurchasedCredits } from "../services/creditsService.ts";

export const getCreditsBalanceHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const creditsBalance = await getCreditsBalance(userId);
    res.json({ creditsBalance });
};

export const checkCreditsAvailabilityHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const isAvailable = await checkCreditsAvailability(userId);
    res.json({ isAvailable });
};

export const checkPurchaseHistoryHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    
    try {
        const hasPurchased = await hasUserPurchasedCredits(userId);
        res.json({ hasPurchased });
    } catch (err) {
        res.status(500).json({ 
            error: err instanceof Error ? err.message : "Failed to check purchase history" 
        });
    }
}; 