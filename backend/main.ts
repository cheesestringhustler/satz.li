// @deno-types="npm:@types/express@4"
import express from "npm:express@4";
import { optimizeText } from "./optimize.ts";
import { detectLanguage } from "./detectLanguage.ts";

const app = express();
const port = 3000;

app.use(express.json());

// Serve static files from the 'dist' directory, used for production
app.use(express.static("dist"));

app.post('/api/optimize', async (req, res) => {
    const { text, language, customPrompt, modelType } = req.body;
    await optimizeText(text, language, customPrompt, modelType, res);
});

app.post('/api/detect-language', async (req, res) => {
    const { text } = req.body;
    await detectLanguage(text, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
