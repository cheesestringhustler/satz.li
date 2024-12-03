import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { 
    getRequestsBalanceHandler,
    checkRequestAvailabilityHandler,
} from "../controllers/requestsController.ts";

const router = Router();

router.get('/requests/balance', authenticateToken, getRequestsBalanceHandler);
router.post('/requests/check-availability', authenticateToken, checkRequestAvailabilityHandler);

export default router; 