import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { getCreditsBalanceHandler } from "../controllers/creditsController.ts";

const router = Router();

router.get('/credits', authenticateToken, getCreditsBalanceHandler);

export default router;