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
import calendarRoutes from "./routes/calendarRoutes.js"; // placeholder

// Load environment variables
dotenv.config();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================
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

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/starting-balance", startingBalanceRoutes);
app.use("/api/paycheck-settings", paycheckSettingsRoutes);

// Placeholder (calendar handled fully on frontend)
app.use("/api/calendar", calendarRoutes);

// ===============================
// Root Status Route
// ===============================
app.get("/", (req, res) => {
  res.send("Underground Water 2 API is running ✅");
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});