import { Request, Response } from "npm:express@4";
import { optimizeText } from "../services/textService.ts";
import { detectLanguage } from "../services/languageService.ts";

export const optimizeTextHandler = async (req: Request, res: Response) => {
    const { text, language, customPrompt, modelType } = req.body;
    await optimizeText(text, language, customPrompt, modelType, res);
};

export const detectLanguageHandler = async (req: Request, res: Response) => {
    const { text } = req.body;
    await detectLanguage(text, res);
}; 