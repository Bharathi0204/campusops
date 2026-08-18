import {Request, Response} from 'express';
import {getDashboardData} from '../services/dashboardService';
export const getDashboardStatsController = async ( _req: Request, res: Response): Promise<void> => {
    try {
        const stats = await getDashboardData();
        res.status(200).json(stats);
    } catch (error) {
        console.error("Dashboard statistics error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
}