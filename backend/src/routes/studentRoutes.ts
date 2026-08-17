import { Router } from "express";
import pool from "../config/db.js";
import { studentSchema } from "../validators/studentValidator.js";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from "../controllers/studentController.js";

const router = Router();

router.get("/", getStudents);

// GET student by ID
router.get("/:id", getStudentById);

// CREATE student
router.post("/", createStudent);

// UPDATE student
router.put("/:id", updateStudent);

// DELETE student
router.delete("/:id", deleteStudent);

export default router;