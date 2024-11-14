import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { BaseChatModel } from "npm:@langchain/core/language_models/chat_models";
import { 
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate 
} from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { Response } from "npm:express@4";
import { config } from "../config/index.ts";

type ModelConfig = {
    class: typeof ChatAnthropic | typeof ChatOpenAI;
    config: {
        modelName: string;
        anthropicApiKey?: string;
        apiKey?: string;
    };
};

const MODEL_MAP: Record<string, ModelConfig> = {
    'claude-3-haiku': {
        class: ChatAnthropic,
        config: {
            modelName: "claude-3-haiku-20240307",
            anthropicApiKey: config.ai.anthropicApiKey,
        }
    },
    'claude-3-5-sonnet': {
        class: ChatAnthropic,
        config: {
            modelName: "claude-3-5-sonnet-20241022",
            anthropicApiKey: config.ai.anthropicApiKey,
        }
    },
    'gpt-4o-mini': {
        class: ChatOpenAI,
        config: {
            modelName: "gpt-4o-mini",
            apiKey: config.ai.openaiApiKey,
        }
    },
    'gpt-4o': {
        class: ChatOpenAI,
        config: {
            modelName: "gpt-4o",
            apiKey: config.ai.openaiApiKey,
        }
    }
};

const createBasePrompt = (
    systemMessage: string,
    humanMessage: string = "Geben Sie nur den korrigierten Text zurück. Zu korrigierender Text:\n{text}",
    customInstructionsMessage: string = "Befolgen Sie zusätzlich zu den obigen Anweisungen diese Anweisungen: {customPrompt}"
) => ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemMessage),
    HumanMessagePromptTemplate.fromTemplate(humanMessage),
    HumanMessagePromptTemplate.fromTemplate(customInstructionsMessage)
]);

const PROMPTS = {
    'de-ch': createBasePrompt(
        `Sie sind ein Textassistent, der speziell für Schweizer Hochdeutsch optimiert ist. Sie verbessern, erstellen und verändern Texte des Benutzers.\n
        Folgende Anweisungen müssen Sie befolgen, um den Text des Benutzers zu verbessern:\n
        1. Grammatik und Syntax: Grundlegende Fehlerkorrektur, Grammatikvorschläge und strukturelle Änderungen zur Verbesserung der Lesbarkeit.\n
        2. Schweizer Standarddeutsch: Verwendung der schweizerischen Schreibweise (ß -> ss, etc.) und Berücksichtigung schweizerischer Ausdrücke.`
    ),
    'de': createBasePrompt(
        `Sie sind ein Textassistent, der Texte des Benutzers verbessert, erstellt und verändert.\n
        Folgende Anweisungen müssen Sie befolgen, um den Text des Benutzers zu verbessern:\n
        1. Grammatik und Syntax: Grundlegende Fehlerkorrektur, Grammatikvorschläge und strukturelle Änderungen zur Verbesserung der Lesbarkeit.`
    ),
    'en': createBasePrompt(
        `You are a Text Assistant here to improve, generate and change text from the user.\n
        Following are a set of instructions that you need to follow in order to improve the users text:\n
        1. Grammar and Syntax: Basic error correction, grammar suggestions, and structural changes to improve readability.`,
        "Please only return the corrected text. Text to correct:\n{text}",
        "Additionally follow these instructions: {customPrompt}"
    )
};

export async function optimizeText(
    text: string,
    language: string,
    customPrompt: string,
    modelType: string,
    res: Response
) {
    try {
        const modelConfig = MODEL_MAP[modelType];
        if (!modelConfig) {
            throw new Error(`Unknown model type: ${modelType}`);
        }

        const model = new modelConfig.class(modelConfig.config) as BaseChatModel;
        const prompt = PROMPTS[language as keyof typeof PROMPTS] || PROMPTS.en;

        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        const stream = await chain.stream({ text, language, customPrompt });

        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        const response = res as Response & { write(chunk: string): boolean; };
        for await (const chunk of stream) {
            if (chunk) {
                response.write(chunk);
            }
        }
        response.send();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 