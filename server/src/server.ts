import express from "express";
import cors from "cors";
import pool from "./db";
import authRoutes from "./auth";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "ProductFlow server is running",
      database: "Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      message: "ProductFlow server is running",
      database: "Connection failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`ProductFlow server running on port ${PORT}`);
});