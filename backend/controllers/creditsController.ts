import { Request, Response } from "npm:express@4";
import { getCreditsBalance } from "../services/creditService.ts";

export const getCreditsBalanceHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const creditsBalance = await getCreditsBalance(userId);
    res.json({ creditsBalance });
};