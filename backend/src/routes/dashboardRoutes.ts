import {Router} from "express";
import {getDashboardStatsController} from "../controllers/dashboardController";

const router = Router();
router.get('/stats', getDashboardStatsController);

export default router;
