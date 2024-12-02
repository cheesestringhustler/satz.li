import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { 
    verifyPaymentSession, 
    createRequestPaymentSessionHandler,
} from "../controllers/paymentController.ts";

const router = Router();

router.post('/payment/create-request-session', authenticateToken, createRequestPaymentSessionHandler);
router.post('/payment/verify', authenticateToken, verifyPaymentSession);

export default router;
