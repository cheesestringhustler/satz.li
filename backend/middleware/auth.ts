import { Response, NextFunction } from "npm:express@4";
import jwt from "npm:jsonwebtoken";
import { config } from "../config/index.ts";
import { validateToken, refreshToken } from "../services/authService.ts";
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
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
        
        // Validate token
        const user = await validateToken(token);
        if (!user) {
            res.clearCookie('accessToken', config.cookie);
            return res.status(401).json({ error: 'Token has been revoked or expired' });
        }

        // Validate email
        if (decoded.email !== user.email) {
            res.clearCookie('accessToken', config.cookie);
            return res.status(401).json({ error: 'Token validation failed' });
        }

        // Refresh token if it expires in less than 3 days
        const tokenExp = decoded.exp! * 1000;
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        if (tokenExp - Date.now() < threeDays) {
            const newToken = await refreshToken(user.id, user.email);
            res.cookie('accessToken', newToken, config.cookie);
        }

        // Set user on request
        const authenticatedReq = req as unknown as AuthenticatedRequest;
        authenticatedReq.user = {
            email: user.email,
            credits_balance: user.credits_balance
        };
        next();
    } catch (err) {
        // Clear token if error
        res.clearCookie('accessToken', config.cookie);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token format' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
}; 