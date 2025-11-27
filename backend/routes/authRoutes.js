// backend/routes/authRoutes.js
// ========================================
// Underground Water 2 - Auth Routes
// Signup, Login, Verify Token
// ========================================

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Helper: generate JWT
function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// ========================================
// SIGNUP
// POST /api/auth/signup
// ========================================
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ email, password: hashed });

    const token = createToken(user);

    return res.json({
      token,
      email: user.email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup error" });
  }
});

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);

    return res.json({
      token,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login error" });
  }
});

// ========================================
// VERIFY TOKEN
// GET /api/auth/verify
// ========================================
router.get("/verify", auth, async (req, res) => {
  try {
    return res.json({
      email: req.userEmail,
    });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Verify error" });
  }
});

export default router;