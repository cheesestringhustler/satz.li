import express from "npm:express@4";
import cookieParser from "npm:cookie-parser";
import { config } from "./config/index.ts";
import { runMigrations } from "./db/migrations.ts";
import authRoutes from "./routes/authRoutes.ts";
import textRoutes from "./routes/textRoutes.ts";
import creditsRoutes from "./routes/creditsRoutes.ts";
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static("dist")); // Serve static files from the 'dist' directory

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', textRoutes);
app.use('/api', creditsRoutes);

// Run migrations before starting the server
await runMigrations();

app.listen(config.environment.port, () => {
    console.log(`Server is running on http://localhost:${config.environment.port}`);
}); 