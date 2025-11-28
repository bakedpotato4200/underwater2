// backend/server.js
// ========================================
// Underground Water 2 - Backend Server
// Complete server file with ALL updated routes
// ========================================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import startingBalanceRoutes from "./routes/startingBalanceRoutes.js";
import paycheckSettingsRoutes from "./routes/paycheckSettingsRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// Middleware
// ========================================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// ========================================
// Serve Frontend Static Files
// ========================================
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ========================================
// API Routes
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/starting-balance", startingBalanceRoutes);
app.use("/api/paycheck-settings", paycheckSettingsRoutes);
app.use("/api/calendar", calendarRoutes);

// ========================================
// SPA Fallback: Serve index.html for all other routes
// ========================================
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ========================================
// MongoDB Connection
// ========================================
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ ERROR: MONGO_URI missing from .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, { dbName: "underwaterDB" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${frontendPath}`);
  console.log(`🔗 API available at: /api`);
});