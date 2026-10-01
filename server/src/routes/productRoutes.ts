import express from "express";
import pool from "../db";
import { authenticateToken } from "../authMiddleware";

const router = express.Router();


// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, status } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    const user = (req as any).user;

    const result = await pool.query(
      `INSERT INTO products
       (name, description, price, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name,
        description || null,
        price || null,
        status || "active",
        user.userId,
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const result = await pool.query(
      `SELECT * FROM products
       WHERE created_by = $1
       ORDER BY created_at DESC`,
      [user.userId]
    );

    res.json({
      message: "Products fetched successfully",
      products: result.rows,
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, status } = req.body;

    const user = (req as any).user;

    const result = await pool.query(
      `UPDATE products
       SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         status = COALESCE($4, status)
       WHERE id = $5 AND created_by = $6
       RETURNING *`,
      [
        name,
        description,
        price,
        status,
        id,
        user.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product updated successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = (req as any).user;

    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1 AND created_by = $2
       RETURNING *`,
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});
// ==========================================
// DASHBOARD STATS
// GET /api/products/dashboard/stats
// ==========================================

router.get("/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE status = 'active') AS active_products,
        COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_products,
        COALESCE(SUM(price), 0) AS total_value
       FROM products
       WHERE created_by = $1`,
      [user.userId]
    );

    res.json({
      message: "Dashboard stats fetched successfully",
      stats: result.rows[0],
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


export default router;