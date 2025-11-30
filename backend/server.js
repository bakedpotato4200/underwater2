import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paycheckSettingsRoutes from "./routes/paycheckSettingsRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration for Railway/Vercel
const allowedOrigins = (process.env.CORS_ORIGINS || "https://underwater2-sigma.vercel.app").split(",").map(url => url.trim());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Underwater Backend Running" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/bills", billRoutes);
app.use("/calendar", calendarRoutes);
app.use("/categories", categoryRoutes);
app.use("/paycheck-settings", paycheckSettingsRoutes);

// MongoDB Connect
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
