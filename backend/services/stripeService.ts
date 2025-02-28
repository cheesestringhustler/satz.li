import Stripe from "npm:stripe";
import sql from "../db/connection.ts";
import { config } from "../config/index.ts";

const stripe = new Stripe(config.stripe.secretKey);

export async function createPaymentSession(
    userId: number,
    email: string,
    amount: number,
    price: number
) {
    try {
        // First check if user exists
        const user = await sql`
            SELECT id, stripe_customer_id 
            FROM users 
            WHERE id = ${userId}
        `;

        if (user.length === 0) {
            throw new Error('User not found');
        }

        let customerId = user[0].stripe_customer_id;

        if (!customerId) {
            // Try to find existing customer by email
            const customers = await stripe.customers.list({
                limit: 1,
                email: email
            });

            if (customers.data.length > 0) {
                // Use existing customer
                customerId = customers.data[0].id;
            } else {
                // Create new customer
                const customer = await stripe.customers.create({
                    email: email,
                    metadata: {
                        userId: userId.toString()
                    }
                });
                customerId = customer.id;
            }

            // Store the customer ID in the users table
            await sql`
                UPDATE users 
                SET stripe_customer_id = ${customerId}
                WHERE id = ${userId}
            `;
        }

        // Create the session with the customer ID
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${amount} Credits`,
                            description: 'Credits for AI text optimization',
                        },
                        unit_amount: price * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${config.environment.isProduction ? 'https' : 'http'}://${config.environment.domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.environment.isProduction ? 'https' : 'http'}://${config.environment.domain}/payment/cancel`,
            metadata: {
                userId: userId.toString(),
                amount: amount.toString()
            },
        });

        return session;
    } catch (error) {
        console.error('Error creating payment session:', error);
        throw error;
    }
}

interface WebhookHandlerResponse {
    success: boolean;
    error?: string;
}

export async function handleStripeWebhookEvent(
    event: Stripe.Event
): Promise<WebhookHandlerResponse> {
    try {
        if (!config.environment.isProduction) {
            console.log("Stripe webhook event:", event.type);
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = Number(session.metadata?.userId);
                const amount = Number(session.metadata?.amount);
                const paymentIntentId = session.payment_intent as string;

                if (!userId || !amount) {
                    throw new Error('Missing userId or amount in session metadata');
                }

                // Add credits to user's balance
                // TODO: make this dynamic check prior to purchase
                await sql`
                    UPDATE users 
                    SET credits_balance = credits_balance + ${config.credits.tier1Credits}
                    WHERE id = ${userId}
                `;

                // Log the transaction with payment intent ID
                await sql`
                    INSERT INTO credits_transactions (
                        user_id,
                        amount,
                        transaction_type,
                        reference_id,
                        notes
                    ) VALUES (
                        ${userId},
                        ${amount},
                        'purchase_credits',
                        ${paymentIntentId},
                        'Stripe payment'
                    )
                `;

                if (!config.environment.isProduction) {
                    console.log(`Stripe webhook event: ${event.type}`);
                }

                break;
            }
            default:
                if (!config.environment.isProduction) {
                    console.log(`Unhandled event type: ${event.type}`);
                }
                break;
        }

        return { success: true };
    } catch (err) {
        console.error("Webhook processing error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}
