// backend/server.js
// ===============================
// Underwater Backend Server (Cleaned)
// Only the required APIs remain.
// Calendar is fully frontend-based.
// ===============================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";

// Calendar routes now empty (placeholder only)
import calendarRoutes from "./routes/calendarRoutes.js";

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { dbName: "underwaterDB" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/recurring", recurringRoutes);

// Calendar endpoint is now empty, but kept so imports don't break
app.use("/api/calendar", calendarRoutes);

// Root Test Route
app.get("/", (req, res) => {
  res.send("Underwater API running");
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
