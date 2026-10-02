"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("./db"));
const authMiddleware_1 = require("./authMiddleware");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
// =========================
// REGISTER
// =========================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }
        const existingUser = await db_1.default.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db_1.default.query(`INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`, [name, email, hashedPassword]);
        return res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0],
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const result = await db_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
        }, JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
// =========================
// GET CURRENT USER
// =========================
router.get("/me", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const result = await db_1.default.query("SELECT id, name, email FROM users WHERE id = $1", [user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.json({
            message: "Authenticated user",
            user: result.rows[0],
        });
    }
    catch (error) {
        console.error("User fetch error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.default = router;
