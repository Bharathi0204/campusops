import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/dashboard", dashboardRoutes);

// Test PostgreSQL connection
pool.query("SELECT NOW()")
  .then((result) => {
    console.log("PostgreSQL connected!");
    console.log("Database time:", result.rows[0].now);
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error);
  });

// Student routes
app.use("/students", studentRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Student CRUD API is running!"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});