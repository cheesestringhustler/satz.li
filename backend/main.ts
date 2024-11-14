// @deno-types="npm:@types/express@4"
import express, { 
    Request, 
    Response, 
    NextFunction, 
    CookieOptions 
} from "npm:express@4";
import jwt from "npm:jsonwebtoken";
import cookieParser from "npm:cookie-parser";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { optimizeText } from "./optimize.ts";
import { detectLanguage } from "./detectLanguage.ts";
import { sendMagicLink } from "./auth/sendMagicLink.ts";
import { validateEmail } from "./auth/validateEmail.ts";
import { validateToken, revokeToken, validateMagicLinkToken, createUserSession } from "./db/users.ts";
import { runMigrations } from "./db/migrations.ts";

type RequestWithCookies = Request & { cookies: { [key: string]: string } };
type AuthenticatedRequest = Request & { user: { email: string, credits_balance: number } };

const env = await load();
const app = express();
const port = 3000;
const JWT_SECRET = env.JWT_SECRET;
const isProduction = env.NODE_ENV === "production";

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
const authenticateToken = async (req: RequestWithCookies, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // First verify JWT signature to fail fast if token is malformed
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        
        // Then check database validity
        const user = await validateToken(token);
        if (!user) {
            res.clearCookie('accessToken', cookieConfig);
            return res.status(401).json({ error: 'Token has been revoked or expired' });
        }

        // Additional check for token payload match
        if (decoded.email !== user.email) {
            res.clearCookie('accessToken', cookieConfig); 
            return res.status(401).json({ error: 'Token validation failed' });
        }

        // Token is valid, attach user info to request
        (req as AuthenticatedRequest).user = {
            email: user.email,
            credits_balance: user.credits_balance
        };
        next();
    } catch (err) {
        // More specific error handling
        res.clearCookie('accessToken', cookieConfig);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token format' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
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

app.get('/api/auth/verify', async (req: Request, res: Response) => {
    const { token } = req.query;
    
    try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as jwt.JwtPayload;
        
        // Validate magic link token
        const isValidMagicToken = await validateMagicLinkToken(token as string);
        if (!isValidMagicToken) {
            return res.status(400).json({ error: 'Magic link has expired or already been used' });
        }

        // Mark token as used and create session
        const user = await createUserSession(decoded.email, token as string, JWT_SECRET);
        
        // Set the cookie
        res.cookie('accessToken', user.accessToken, cookieConfig);
        res.json({ success: true });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ error: 'Invalid magic link format' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ error: 'Magic link has expired' });
        }
        res.status(400).json({ error: 'Invalid or expired magic link' });
    }
});

// Add a logout endpoint
app.post('/api/auth/logout', async (req: RequestWithCookies, res: Response) => {
    const token = req.cookies.accessToken;
    if (token) {
        await revokeToken(token);
    }
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
    const authenticatedReq = req as AuthenticatedRequest;
    res.json({ 
        authenticated: true,
        user: {
            email: authenticatedReq.user.email,
            creditsBalance: authenticatedReq.user.credits_balance
        }
    });
});

// Run migrations before starting the server
await runMigrations();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
