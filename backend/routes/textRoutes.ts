import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import {
    optimizeTextHandler,
    detectLanguageHandler
} from "../controllers/textController.ts";

const router = Router();

router.post('/optimize', authenticateToken, optimizeTextHandler);
router.post('/detect-language', authenticateToken, detectLanguageHandler);

export default router; 