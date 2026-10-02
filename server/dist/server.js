"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const auth_1 = __importDefault(require("./auth"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Auth routes
app.use("/api/auth", auth_1.default);
// Product routes
app.use("/api/products", productRoutes_1.default);
// Health Check
app.get("/api/health", async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT NOW()");
        res.json({
            message: "ProductFlow server is running",
            database: "Connected",
            time: result.rows[0].now,
        });
    }
    catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({
            message: "ProductFlow server is running",
            database: "Connection failed",
        });
    }
});
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`ProductFlow server running on port ${PORT}`);
});
