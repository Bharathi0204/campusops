import pool from "./config/db.js";

const firstNames = [
  "Arun",
  "Kavya",
  "Rahul",
  "Sneha",
  "Vikram",
  "Ananya",
  "Rohit",
  "Divya",
  "Naveen",
  "Meena",
  "Sanjay",
  "Keerthi",
  "Ajay",
  "Swetha",
  "Dinesh",
  "Harini",
  "Prakash",
  "Nithya",
  "Vijay",
  "Pooja"
];

const lastNames = [
  "Kumar",
  "Sharma",
  "Patel",
  "Reddy",
  "Krishnan"
];

async function seedStudents() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (let i = 1; i <= 97; i++) {
      const firstName = firstNames[(i - 1) % firstNames.length];
      const lastName = lastNames[(i - 1) % lastNames.length];

      const name = `${firstName} ${lastName} ${i}`;
      const email = `student${i}@example.com`;
      const age = 18 + (i % 13);

      await client.query(
        `INSERT INTO students (name, email, age)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING`,
        [name, email, age]
      );
    }

    await client.query("COMMIT");

    const result = await client.query(
      "SELECT COUNT(*) FROM students"
    );

    console.log(
      `Seeding complete. Total students: ${result.rows[0].count}`
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Seeding failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedStudents();