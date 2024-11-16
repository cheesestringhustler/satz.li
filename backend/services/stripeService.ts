import Stripe from "npm:stripe";
import sql from "../db/connection.ts";
import { config } from "../config/index.ts";

const stripe = new Stripe(config.stripe.secretKey);

export async function createPaymentSession(
    userId: number,
    credits: number,
    price: number,
) {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${credits} Credits`,
                        description: "Credits for AI text optimization",
                    },
                    unit_amount: price * 100, // Convert to cents
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url:
            `${config.environment.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.environment.frontendUrl}/payment/cancel`,
        metadata: {
            userId: userId.toString(),
            credits: credits.toString(),
        },
    });

    return session;
}

export async function handleStripeWebhook(event: Stripe.Event) {
    console.log("Stripe webhook event:", event);
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = Number(session.metadata?.userId);
            const credits = Number(session.metadata?.credits);

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
}
