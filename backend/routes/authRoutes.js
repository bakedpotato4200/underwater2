// backend/routes/authRoutes.js
// ========================================
// Underground Water 2 - Auth Routes
// Signup, Login, Verify Token
// ========================================

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import StartingBalance from "../models/StartingBalance.js";
import PaycheckSettings from "../models/PaycheckSettings.js";
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

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
    });

    // Create default starting balance
    await StartingBalance.create({
      userId: user._id,
      startingBalance: 0,
    });

    // Create default paycheck settings
    await PaycheckSettings.create({
      userId: user._id,
      payAmount: 0,
      frequency: "biweekly",
      startDate: new Date(),
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

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Email not found. Please sign up" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
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
    const user = await User.findById(req.userId).select("email");
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