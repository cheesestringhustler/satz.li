import { Router } from "npm:express@4";
import { authenticateToken } from "../middleware/auth.ts";
import { getRequestLimits } from "../controllers/configController.ts";

const router = Router();

router.get('/config/limits', getRequestLimits);

export default router;
