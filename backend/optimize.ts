import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { HumanMessage } from "npm:@langchain/core/messages";
import { Response } from "npm:express@4";

const model = new ChatOpenAI({ 
  modelName: "gpt-4o-mini"
});

const basePrompt = `Correct the text to have proper spelling, grammar, and punctuation`; 
const systemPrompt = `${basePrompt}. The language of the text is {language}.` 
const userPrompt = `${basePrompt}. Return only the corrected text. Text to correct:\n{text}`;

const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    new MessagesPlaceholder("customPrompt"),
    HumanMessagePromptTemplate.fromTemplate(userPrompt),
]);
const parser = new StringOutputParser();
// @ts-ignore ChatOpenAI type
const chain = prompt.pipe(model).pipe(parser);

export async function optimizeText(text: string, language: string, customPrompt: string, res: Response) {
    try {
        const stream = await chain.stream({ text, language, customPrompt: new HumanMessage({ content: "Custom instructions: "+customPrompt }) });

        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        // Define a custom type that extends Response
        const response = res as Response & { write(chunk: string): boolean; };
        for await (const chunk of stream) {
            if (chunk) {
                response.write(chunk);
            }
        }

        console.log(await prompt.formatMessages({ text, language, customPrompt: new HumanMessage({ content: customPrompt }) }));

        response.send();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}

