"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../authMiddleware");
const router = express_1.default.Router();
// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================
router.post("/", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { name, description, price, status } = req.body;
        if (!name) {
            return res.status(400).json({
                message: "Product name is required",
            });
        }
        const user = req.user;
        const result = await db_1.default.query(`INSERT INTO products
       (name, description, price, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [
            name,
            description || null,
            price || null,
            status || "active",
            user.userId,
        ]);
        return res.status(201).json({
            message: "Product created successfully",
            product: result.rows[0],
        });
    }
    catch (error) {
        console.error("Create product error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================
router.get("/", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const result = await db_1.default.query(`SELECT * FROM products
       WHERE created_by = $1
       ORDER BY created_at DESC`, [user.userId]);
        return res.json({
            message: "Products fetched successfully",
            products: result.rows,
        });
    }
    catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================
router.put("/:id", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, status } = req.body;
        const user = req.user;
        const result = await db_1.default.query(`UPDATE products
       SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         status = COALESCE($4, status)
       WHERE id = $5 AND created_by = $6
       RETURNING *`, [
            name,
            description,
            price,
            status,
            id,
            user.userId,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }
        return res.json({
            message: "Product updated successfully",
            product: result.rows[0],
        });
    }
    catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================
router.delete("/:id", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const result = await db_1.default.query(`DELETE FROM products
       WHERE id = $1 AND created_by = $2
       RETURNING *`, [id, user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }
        return res.json({
            message: "Product deleted successfully",
            product: result.rows[0],
        });
    }
    catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
// ==========================================
// DASHBOARD STATS
// GET /api/products/dashboard/stats
// ==========================================
router.get("/dashboard/stats", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const result = await db_1.default.query(`SELECT
          COUNT(*) AS total_products,
          COUNT(*) FILTER (WHERE status = 'active') AS active_products,
          COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_products,
          COALESCE(SUM(price), 0) AS total_value
         FROM products
         WHERE created_by = $1`, [user.userId]);
        const stats = result.rows[0];
        return res.json({
            message: "Dashboard stats fetched successfully",
            // Send stats directly because App.tsx
            // expects data.total_products etc.
            total_products: Number(stats.total_products),
            active_products: Number(stats.active_products),
            total_value: Number(stats.total_value),
        });
    }
    catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.default = router;
