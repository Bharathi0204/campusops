import { Request, Response } from "express";
import pool from "../config/db.js";
import { studentSchema } from "../validators/studentValidator.js";


// GET all students
export const getStudents = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const offset = (page - 1) * limit;

    let countQuery = "SELECT COUNT(*) FROM students";
    let studentsQuery = `
      SELECT * FROM students
    `;

    const queryParams: (string | number)[] = [];

    if (search) {
      countQuery += `
        WHERE name ILIKE $1
        OR email ILIKE $1
      `;

      studentsQuery += `
        WHERE name ILIKE $1
        OR email ILIKE $1
      `;

      queryParams.push(`%${search}%`);
    }

    studentsQuery += `
      ORDER BY id
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
    `;

    const countResult = await pool.query(
      countQuery,
      search ? [`%${search}%`] : []
    );

    const totalStudents = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalStudents / limit);

    const result = await pool.query(
      studentsQuery,
      [...queryParams, limit, offset]
    );

    res.json({
      students: result.rows,
      page,
      limit,
      search,
      totalStudents,
      totalPages
    });
  } catch (error) {
    console.error("Error fetching students:", error);

    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
};

// GET student by ID
export const getStudentById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM students WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching student:", error);

    res.status(500).json({
      message: "Failed to fetch student"
    });
  }
};

// create a new student
export const createStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const validationResult = studentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.issues
      });
    }

    const { name, email, age } = validationResult.data;

    const result = await pool.query(
      "INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name, email, age]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating student:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create student"
    });
  }
};

// update an existing student
export const updateStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const validationResult = studentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.issues
      });
    }

    const { name, email, age } = validationResult.data;

    const result = await pool.query(
      `UPDATE students
       SET name = $1, email = $2, age = $3
       WHERE id = $4
       RETURNING *`,
      [name, email, age, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating student:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({
      message: "Failed to update student"
    });
  }
};
// delete a student
export const deleteStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully",
      student: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting student:", error);

    res.status(500).json({
      message: "Failed to delete student"
    });
  }
};