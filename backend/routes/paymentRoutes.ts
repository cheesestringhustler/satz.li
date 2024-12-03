import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { 
    verifyPaymentSession, 
    createCreditsPaymentSessionHandler,
} from "../controllers/paymentController.ts";

const router = Router();

router.post('/payment/create-credits-session', authenticateToken, createCreditsPaymentSessionHandler);
router.post('/payment/verify', authenticateToken, verifyPaymentSession);

export default router;
