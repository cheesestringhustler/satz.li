// @deno-types="npm:@types/express@4"
import express, { Request, Response, NextFunction } from "npm:express@4";
import { optimizeText } from "./optimize.ts";
import { detectLanguage } from "./detectLanguage.ts";
import jwt from "npm:jsonwebtoken";
import { sendMagicLink } from "./auth/sendMagicLink.ts";
import { validateEmail } from "./auth/validateEmail.ts";

const app = express();
const port = 3000;
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key"; // In production, always use environment variable

app.use(express.json());

// Serve static files from the 'dist' directory, used for production
app.use(express.static("dist"));

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | undefined) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        (req as Request & { user: jwt.JwtPayload }).user = user;
        next();
    });
};

// Authentication endpoints
app.post('/api/auth/request-magic-link', async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    await sendMagicLink(email);
    res.json({ message: 'Magic link sent to email' });
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
    const { token } = req.query;
    
    try {
        const decoded = jwt.verify(token as string, JWT_SECRET);
        const accessToken = jwt.sign({ email: decoded.email }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired magic link' });
    }
});

// Protected routes - add authenticateToken middleware
app.post('/api/optimize', authenticateToken, async (req: Request, res: Response) => {
    const { text, language, customPrompt, modelType } = req.body;
    await optimizeText(text, language, customPrompt, modelType, res);
});

app.post('/api/detect-language', authenticateToken, async (req: Request, res: Response) => {
    const { text } = req.body;
    await detectLanguage(text, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
