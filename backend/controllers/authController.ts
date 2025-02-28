import { Request, Response } from "npm:express@4";
import { validateEmail } from "../utils/validateEmail.ts";
import { 
    sendMagicLink, 
    validateMagicLinkToken, 
    createUserSession, 
    revokeToken 
} from "../services/authService.ts";
import { config } from "../config/index.ts";
import jwt from "npm:jsonwebtoken";
import { AuthenticatedRequest } from "../types/express.ts";

export const requestMagicLink = async (req: Request, res: Response) => {
    const { email } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!validateEmail(trimmedEmail)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    await sendMagicLink(trimmedEmail);
    res.json({ message: 'Magic link sent to email' });
};

export const verifyMagicLink = async (req: Request, res: Response) => {
    const { token } = req.query;
    
    try {
        const decoded = jwt.verify(token as string, config.jwt.secret) as jwt.JwtPayload;
        
        const isValidMagicToken = await validateMagicLinkToken(token as string);
        if (!isValidMagicToken) {
            return res.status(400).json({ error: 'Magic link has expired or already been used' });
        }

        const { user, accessToken } = await createUserSession(decoded.email.trim().toLowerCase(), token as string);
        
        res.cookie('accessToken', accessToken, config.cookie);
        res.json({ 
            success: true,
            user: {
                email: user.email,
                creditsBalance: user.credits_balance
            }
        });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ error: 'Invalid magic link format' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ error: 'Magic link has expired' });
        }
        res.status(400).json({ error: 'Invalid or expired magic link' });
    }
};

export const logout = async (req: Request, res: Response) => {
    const token = req.cookies.accessToken;
    if (token) {
        await revokeToken(token);
    }
    res.clearCookie('accessToken', config.cookie);
    res.json({ success: true });
};

export const getAuthStatus = (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    res.json({ 
        authenticated: true,
        user: {
            email: authenticatedReq.user.email,
            creditsBalance: authenticatedReq.user.credits_balance
        }
    });
}; 