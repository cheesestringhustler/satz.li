// @deno-types="npm:@types/express@4"
import express, { Response } from "npm:express@4";
import { optimizeText } from "./optimize.ts";

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/optimize', async (req, res) => {
    const { text } = req.body;
    await optimizeText(text, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
