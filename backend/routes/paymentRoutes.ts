import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { 
    verifyPaymentSession, 
    createPaymentSessionHandler,
} from "../controllers/paymentController.ts";

const router = Router();

router.post('/payment/create-session', authenticateToken, createPaymentSessionHandler);
router.post('/payment/verify', authenticateToken, verifyPaymentSession);

export default router;
