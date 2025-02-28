import express from "npm:express@4";
import cookieParser from "npm:cookie-parser";
import { Request, Response } from "npm:express@4";
import path from "npm:path";

import { config } from "./config/index.ts";
import { handleStripeWebhookHandler } from "./controllers/paymentController.ts";
import { runMigrations } from "./db/migrations.ts";
import authRoutes from "./routes/authRoutes.ts";
import configRoutes from "./routes/configRoutes.ts";
import creditsRoutes from "./routes/creditsRoutes.ts";
import paymentRoutes from "./routes/paymentRoutes.ts";
import textRoutes from "./routes/textRoutes.ts";

const app = express();

// Stripe webhook needs raw body
app.post('/api/webhook/stripe', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhookHandler
);

// Regular middleware for other routes
app.use(express.json());
app.use(cookieParser());
app.use(express.static("dist"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', textRoutes);
app.use('/api', creditsRoutes);
app.use('/api', paymentRoutes);
app.use('/api', configRoutes);

// Handle React Router routes
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

// Run migrations before starting the server
await runMigrations();

app.listen(config.environment.port, () => {
    console.log(`Server is running on http://localhost:${config.environment.port}`);
}); 