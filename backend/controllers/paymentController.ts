import Stripe from "npm:stripe";
import { config } from "../config/index.ts";
import { handleStripeWebhook } from "../services/stripeService.ts";
import { Request, Response } from "npm:express@4";
import { AuthenticatedRequest } from "../types/express.ts";
import { createPaymentSession } from "../services/stripeService.ts";
import sql from "../db/connection.ts";
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

export const createPaymentSessionHandler = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { credits, price } = req.body;

    try {
        const session = await createPaymentSession(
            authenticatedReq.user.id,
            credits,
            price,
        );
        res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error
                ? err.message
                : "Failed to create payment session",
        });
    }
};

export const handleStripeWebhookHandler = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        // Get raw body from the request
        const rawBody = req.body;
        
        // Use constructEventAsync instead of constructEvent
        const event = await stripe.webhooks.constructEventAsync(
            rawBody,
            sig as string,
            config.stripe.webhookSecret
        );
        
        // console.log("Stripe webhook event:", event.type);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = Number(session.metadata?.userId);
                const credits = Number(session.metadata?.credits);

                if (!userId || !credits) {
                    throw new Error('Missing userId or credits in session metadata');
                }

                // Add credits to user's balance
                await sql`
                    UPDATE users 
                    SET credits_balance = credits_balance + ${credits}
                    WHERE id = ${userId}
                `;

                // Log the transaction
                await sql`
                    INSERT INTO credits_transactions (
                        user_id,
                        amount,
                        transaction_type,
                        reference_id,
                        notes
                    ) VALUES (
                        ${userId},
                        ${credits},
                        'purchase',
                        ${session.id},
                        'Stripe payment'
                    )
                `;
                break;
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(400).json({
            error: err instanceof Error ? err.message : "Webhook error",
        });
    }
};
