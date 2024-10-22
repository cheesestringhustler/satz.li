import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatPromptTemplate } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { Response } from "npm:express@4";

const model = new ChatOpenAI({ 
  modelName: "gpt-4o-mini"
});

const template = `You are a helpful assistant that improves German texts. 
Your task is to correct any grammatical errors, improve the style, and make 
the text more natural and fluent. Please provide only the improved version of the text.

Text to improve: {text}`;

const prompt = ChatPromptTemplate.fromTemplate(template);
const parser = new StringOutputParser();
// @ts-ignore ChatOpenAI type
const chain = prompt.pipe(model).pipe(parser);

export async function optimizeText(text: string, res: Response) {
    try {
        const stream = await chain.stream({ text });

        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        // Define a custom type that extends Response
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

