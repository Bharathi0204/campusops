import pool from '../config/db';

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
}

export interface GetCoursesParams {
  page: number;
  limit: number;
  search: string;
}

export interface GetCoursesResult {
  courses: Course[];
  page: number;
  limit: number;
  search: string;
  totalCourses: number;
  totalPages: number;
}

export const getCourses = async ({
  page,
  limit,
  search,
}: GetCoursesParams): Promise<GetCoursesResult> => {
  const offset = (page - 1) * limit;

  const searchTerm = `%${search}%`;

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM courses
      WHERE code ILIKE $1
         OR name ILIKE $1
    `,
    [searchTerm]
  );

  const totalCourses = countResult.rows[0].total;

  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        credits
      FROM courses
      WHERE code ILIKE $1
         OR name ILIKE $1
      ORDER BY id ASC
      LIMIT $2
      OFFSET $3
    `,
    [searchTerm, limit, offset]
  );

  return {
    courses: result.rows,
    page,
    limit,
    search,
    totalCourses,
    totalPages: Math.ceil(totalCourses / limit),
  };
};

export const getCourseById = async (
  id: number
): Promise<Course | null> => {
  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        credits
      FROM courses
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
};

export const createCourse = async (
  code: string,
  name: string,
  credits: number
): Promise<Course> => {
  const result = await pool.query(
    `
      INSERT INTO courses (
        code,
        name,
        credits
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        code,
        name,
        credits
    `,
    [code, name, credits]
  );

  return result.rows[0];
};

export const updateCourse = async (
  id: number,
  code: string,
  name: string,
  credits: number
): Promise<Course | null> => {
  const result = await pool.query(
    `
      UPDATE courses
      SET
        code = $1,
        name = $2,
        credits = $3
      WHERE id = $4
      RETURNING
        id,
        code,
        name,
        credits
    `,
    [code, name, credits, id]
  );

  return result.rows[0] ?? null;
};

export const deleteCourse = async (
  id: number
): Promise<Course | null> => {
  const result = await pool.query(
    `
      DELETE FROM courses
      WHERE id = $1
      RETURNING
        id,
        code,
        name,
        credits
    `,
    [id]
  );

  return result.rows[0] ?? null;
};