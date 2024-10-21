const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked'
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(content);
            }
        }

        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
