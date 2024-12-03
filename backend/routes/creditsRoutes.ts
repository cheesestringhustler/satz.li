import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { 
  getCreditsBalanceHandler, 
  checkCreditsAvailabilityHandler,
} from "../controllers/creditsController.ts";

const router = Router();

router.get('/credits/balance', authenticateToken, getCreditsBalanceHandler);
router.post('/credits/check-availability', authenticateToken, checkCreditsAvailabilityHandler);

export default router;
