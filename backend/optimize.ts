import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { 
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate 
} from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { Response } from "npm:express@4";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

// Define model map for easier model selection
const MODEL_MAP = {
    'claude-3-haiku': {
        class: ChatAnthropic,
        config: {
            modelName: "claude-3-haiku-20240307",
            anthropicApiKey: env.ANTHROPIC_API_KEY,
        }
    },
    'claude-3-5-sonnet': {
        class: ChatAnthropic,
        config: {
            modelName: "claude-3-5-sonnet-20241022", 
            anthropicApiKey: env.ANTHROPIC_API_KEY,
        }
    },
    'gpt-4o-mini': {
        class: ChatOpenAI,
        config: {
            modelName: "gpt-4o-mini",
            apiKey: env.OPENAI_API_KEY,
        }
    },
    'gpt-4o': {
        class: ChatOpenAI,
        config: {
            modelName: "gpt-4o",
            apiKey: env.OPENAI_API_KEY,
        }
    }
};

// Create prompt template using LCEL
const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
        "Correct the text to have proper spelling, grammar, and punctuation. The language of the text is {language}. Improve the text to be more concise and idiomatic."
    ),
    HumanMessagePromptTemplate.fromTemplate(
        "Return only the corrected text. Text to correct:\n{text}"
    ),
    HumanMessagePromptTemplate.fromTemplate(
        "Follow these instructions in addition to the instructions above: {customPrompt}"
    )
]);

export async function optimizeText(text: string, language: string, customPrompt: string, modelType: string, res: Response) {
    // Validate model type
    const modelConfig = MODEL_MAP[modelType];
    if (!modelConfig) {
        return res.status(400).json({ error: `Unknown model type: ${modelType}` });
    }

    // Initialize model
    const model = new modelConfig.class(modelConfig.config);
    
    // Create the chain using LCEL
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    try {
        const stream = await chain.stream({
            text,
            language,
            customPrompt
        });

        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        // Stream the response
        const response = res as Response & { write(chunk: string): boolean; };
        for await (const chunk of stream) {
            if (chunk) {
                response.write(chunk);
            }
        }
        response.send();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}
