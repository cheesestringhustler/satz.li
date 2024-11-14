import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import {
    requestMagicLink,
    verifyMagicLink,
    logout,
    getAuthStatus
} from "../controllers/authController.ts";

const router = Router();

router.post('/request-magic-link', requestMagicLink);
router.get('/verify', verifyMagicLink);
router.post('/logout', logout);
router.get('/status', authenticateToken, getAuthStatus);

export default router; 