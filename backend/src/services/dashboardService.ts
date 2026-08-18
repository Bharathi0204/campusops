import pool from "../config/db";
export interface DashboardData {
    totalStudents: number;
}

export const getDashboardData = async (): Promise<DashboardData> => {
    const result = await pool.query("SELECT COUNT(*)::int AS total_students FROM students");

    return {
        totalStudents: Number(result.rows[0]?.total_students ?? 0),
    };
};