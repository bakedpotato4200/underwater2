// backend/server.js
// ========================================
// Underground Water 2 - Backend Server
// Complete server file with ALL updated routes
// ========================================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔗 API available at: /api`);
});