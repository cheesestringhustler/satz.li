import { Request, Response } from "npm:express@4";
import { config } from "../config/index.ts";

export const getRequestLimits = (_req: Request, res: Response) => {
    try {
        const limits = {
            defaultMaxTextChars: config.requestLimits.defaultMaxTextChars,
            defaultMaxPromptChars: config.requestLimits.defaultMaxPromptChars,
            defaultMaxContextChars: config.requestLimits.defaultMaxContextChars
        };
        
        res.status(200).json(limits);
    } catch (error) {
        console.error('Error fetching request limits:', error);
        res.status(500).json({ error: 'Failed to fetch request limits' });
    }
};
