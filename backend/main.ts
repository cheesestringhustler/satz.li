// @deno-types="npm:@types/express@4"
import express, { Request, Response, NextFunction, CookieOptions } from "npm:express@4";
import { optimizeText } from "./optimize.ts";
import { detectLanguage } from "./detectLanguage.ts";
import jwt from "npm:jsonwebtoken";
import { sendMagicLink } from "./auth/sendMagicLink.ts";
import { validateEmail } from "./auth/validateEmail.ts";
import cookieParser from "npm:cookie-parser";

type RequestWithCookies = Request & { cookies: { [key: string]: string } };

const app = express();
const port = 3000;
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key";
const isProduction = Deno.env.get("NODE_ENV") === "production";

app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'dist' directory, used for production
app.use(express.static("dist"));

// Cookie configuration
const cookieConfig: CookieOptions = {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: isProduction, // Requires HTTPS in production
    sameSite: 'strict', // Protects against CSRF
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/' // Cookie is available for all paths
};

// Middleware to verify JWT token
const authenticateToken = (req: RequestWithCookies, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | undefined) => {
        if (err) {
            res.clearCookie('accessToken', cookieConfig);
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
        
        // Set the cookie instead of sending the token in response
        res.cookie('accessToken', accessToken, cookieConfig);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired magic link' });
    }
});

// Add a logout endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('accessToken', cookieConfig);
    res.json({ success: true });
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

// Add a new endpoint to check auth status
app.get('/api/auth/status', authenticateToken, (req: Request, res: Response) => {
    res.json({ authenticated: true });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
