import { Response, NextFunction } from "npm:express@4";
import jwt from "npm:jsonwebtoken";
import { config } from "../config/index.ts";
import { validateToken } from "../services/authService.ts";
import { RequestWithCookies, AuthenticatedRequest } from "../types/express.ts";

export const authenticateToken = async (
    req: RequestWithCookies,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
        
        const user = await validateToken(token);
        if (!user) {
            res.clearCookie('accessToken', config.cookie);
            return res.status(401).json({ error: 'Token has been revoked or expired' });
        }

        if (decoded.email !== user.email) {
            res.clearCookie('accessToken', config.cookie);
            return res.status(401).json({ error: 'Token validation failed' });
        }

        const authenticatedReq = req as unknown as AuthenticatedRequest;
        authenticatedReq.user = {
            email: user.email,
            credits_balance: user.credits_balance
        };
        next();
    } catch (err) {
        res.clearCookie('accessToken', config.cookie);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token format' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
}; 