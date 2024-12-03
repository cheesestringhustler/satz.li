import { Request, Response } from "npm:express@4";
import { AuthenticatedRequest } from "../types/express.ts";
import { getRequestsBalance, checkRequestAvailability } from "../services/requestsService.ts";

export const getRequestsBalanceHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const requestsBalance = await getRequestsBalance(userId);
    res.json({ requestsBalance });
};

export const checkRequestAvailabilityHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const isAvailable = await checkRequestAvailability(userId, text);
    res.json({ isAvailable });
}; 