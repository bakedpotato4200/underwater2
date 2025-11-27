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

// -----------------------------------------
// Helper: Generate JWT
// -----------------------------------------
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

// =========================================
// SIGNUP
// POST /api/auth/signup
// =========================================
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashed,
    });

    // Token
    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// LOGIN
// POST /api/auth/login
// =========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Token
    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// VERIFY TOKEN
// GET /api/auth/verify
// =========================================
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("email");
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;