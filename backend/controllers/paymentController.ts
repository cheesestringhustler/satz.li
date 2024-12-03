import Stripe from "npm:stripe";
import { config } from "../config/index.ts";
import { Request, Response } from "npm:express@4";
import { AuthenticatedRequest } from "../types/express.ts";
import { createPaymentSession, handleStripeWebhookEvent } from "../services/stripeService.ts";
const stripe = new Stripe(config.stripe.secretKey);

export const verifyPaymentSession = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { sessionId } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Verify that this session belongs to this user
        if (session.metadata?.userId !== authenticatedReq.user.id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Verify payment status
        if (session.payment_status !== "paid") {
            return res.status(400).json({ error: "Payment not completed" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Payment verification error:", err);
        res.status(500).json({
            error: err instanceof Error
                ? err.message
                : "Payment verification failed",
        });
    }
};

export const createRequestPaymentSessionHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { requests, price } = req.body;
    
    // Validate request parameters
    if (!requests || !price || requests !== 500 || price !== 5) { // TODO: Make dynamic and check for valid values for package
        return res.status(400).json({ error: "Invalid request package" });
    }
    
    try {
        const session = await createPaymentSession(
            "buyRequests",
            authenticatedReq.user.id,
            authenticatedReq.user.email,
            requests,
            price,
        );
        res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : "Failed to create payment session"
        });
    }
};

export const handleStripeWebhookHandler = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const rawBody = req.body;
        const event = await stripe.webhooks.constructEventAsync(
            rawBody,
            sig as string,
            config.stripe.webhookSecret
        );
        
        const result = await handleStripeWebhookEvent(event);
        
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(400).json({
            error: err instanceof Error ? err.message : "Webhook error"
        });
    }
};
