import { eld } from "npm:eld";
import { Response } from "npm:express@4";

export async function detectLanguage(text: string, res: Response) {
    try {
        const result = await eld.detect(text);
        
        if (result.isReliable()) {
            res.json({ detectedLanguage: result.language });
        } else {
            res.json({ detectedLanguage: 'none' });
        }
    } catch (error) {
        console.error('Language detection error:', error);
        res.status(500).json({ error: 'Language detection failed' });
    }
} 