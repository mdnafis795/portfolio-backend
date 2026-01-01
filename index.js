import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://YOUR-NETLIFY-SITE.netlify.app"
  ],
  methods: ["GET", "POST"],
  credentials: false
}));

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// test DB
pool.query("SELECT NOW()")
  .then(r => console.log("DB connected:", r.rows[0]))
  .catch(e => console.error("DB ERROR:", e));

// test route
app.get("/", (req, res) => {
  res.send("Backend running");
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// contact API
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    const result = await pool.query(
      `INSERT INTO aboutproject (name, email, message) VALUES ($1,$2,$3) RETURNING *`,
      [name, email, message]
    );

    return res.status(201).json({
      success: true,
      id: result.rows[0].id,
      message: "Message saved"
    });

  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
  
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
