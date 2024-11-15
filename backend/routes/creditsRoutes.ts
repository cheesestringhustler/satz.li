import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { getCreditsBalanceHandler, getCreditsEstimateHandler } from "../controllers/creditsController.ts";

const router = Router();

router.get('/credits', authenticateToken, getCreditsBalanceHandler);
router.post('/credits/estimate', authenticateToken, getCreditsEstimateHandler);

export default router;