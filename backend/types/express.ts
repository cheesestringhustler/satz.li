import { Request } from "npm:express@4";

export interface RequestWithCookies extends Request {
    cookies: { [key: string]: string }
}

export interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        credits_balance: number;
    }
} 