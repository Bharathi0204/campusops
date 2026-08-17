import { z } from "zod";

export const studentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(150, "Email must not exceed 150 characters"),

  age: z
    .number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must not exceed 120")
});