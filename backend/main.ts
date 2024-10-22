// @deno-types="npm:@types/express@4"
import express, { Response } from "npm:express@4";
import { OpenAI } from "https://deno.land/x/openai@v4.68.1/mod.ts";

const app = express();
const port = 3000;

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const openai = new OpenAI({ apiKey: openaiApiKey });

app.use(express.json());

app.post('/api/optimize', async (req, res) => {
    const { text } = req.body;

    const systemPrompt = `You are a helpful assistant that improves German texts. 
    Your task is to correct any grammatical errors, improve the style, and make 
    the text more natural and fluent. Please provide the corrected and improved 
    version of the text.`;

    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            stream: true,
        });

        res.header('Content-Type', 'text/plain');
        res.header('Transfer-Encoding', 'chunked');

        // Define a custom type that extends Response
        const response = res as Response & { write(chunk: string): boolean; };
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                response.write(content);
            }
        }
        response.send();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
