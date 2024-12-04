import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { 
  getCreditsBalanceHandler, 
  checkCreditsAvailabilityHandler,
  checkPurchaseHistoryHandler,
} from "../controllers/creditsController.ts";

const router = Router();

router.get('/credits/balance', authenticateToken, getCreditsBalanceHandler);
router.post('/credits/check-availability', authenticateToken, checkCreditsAvailabilityHandler);
router.get('/credits/purchase-history', authenticateToken, checkPurchaseHistoryHandler);

export default router;
