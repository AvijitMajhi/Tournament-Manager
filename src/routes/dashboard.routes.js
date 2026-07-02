import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getDashboard,getUpcomingMatches,getRecentResults} from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", verifyJWT, getDashboard);
router.get("/upcoming-matches", verifyJWT, getUpcomingMatches);
router.get("/recent-results", verifyJWT, getRecentResults);
export default router;