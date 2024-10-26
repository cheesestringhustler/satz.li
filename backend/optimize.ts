import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { HumanMessage } from "npm:@langchain/core/messages";
import { Response } from "npm:express@4";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

    const modelType: string = 'claude-3-5-sonnet';

let model;
if (modelType === 'claude-3-haiku') {
    model = new ChatAnthropic({
        modelName: "claude-3-haiku-20240307",
        anthropicApiKey: env.ANTHROPIC_API_KEY,
    });
} else if (modelType === 'claude-3-5-sonnet') {
    model = new ChatAnthropic({
        modelName: "claude-3-5-sonnet-20241022",
        anthropicApiKey: env.ANTHROPIC_API_KEY,
    });
} else if (modelType === 'gpt-4o-mini') {
    model = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        apiKey: env.OPENAI_API_KEY,
    });
} else if (modelType === 'gpt-4o') {
    model = new ChatOpenAI({
        modelName: "gpt-4o",
        apiKey: env.OPENAI_API_KEY,
    });
} else {
    throw new Error(`Unknown model type: ${modelType}`);
}

const basePrompt = `Correct the text to have proper spelling, grammar, and punctuation`; 
const systemPrompt = `${basePrompt}. The language of the text is {language}. Improve the text to be more concise and idiomatic.` 
const userPrompt = `${basePrompt}. Return only the corrected text. Text to correct:\n{text}`;

const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    HumanMessagePromptTemplate.fromTemplate(userPrompt),
    new MessagesPlaceholder("customPrompt"),
]);
const parser = new StringOutputParser();
// @ts-ignore ChatOpenAI type
const chain = prompt.pipe(model).pipe(parser);

export async function optimizeText(text: string, language: string, customPrompt: string, res: Response) {
    try {
        const stream = await chain.stream({ text, language, customPrompt: new HumanMessage({ content: "Follow these instructions in addition to the instructions above: "+customPrompt }) });

        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        // Define a custom type that extends Response
        const response = res as Response & { write(chunk: string): boolean; };
        for await (const chunk of stream) {
            if (chunk) {
                response.write(chunk);
            }
        }
        // console.log(await prompt.formatMessages({ text, language, customPrompt: new HumanMessage({ content: customPrompt }) }));
        response.send();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}
