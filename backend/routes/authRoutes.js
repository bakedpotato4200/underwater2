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

    return res.status(201).json({
      token,
      userId: user._id,
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

    return res.status(200).json({
      userId: req.userId,
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

// =========================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =========================================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await User.updateOne(
      { _id: user._id },
      { resetCode, resetCodeExpiry }
    );

    console.log(`🔐 Password reset code for ${email}: ${resetCode}`);

    return res.json({
      message: "Reset code sent. Check console for code (in production, would be sent via email)",
      resetCode // In production, NEVER return this; send via email instead
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =========================================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!resetCode || !resetCode.trim()) {
      return res.status(400).json({ error: "Reset code is required" });
    }
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ error: "New password is required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }

    // Check reset code
    if (user.resetCode !== resetCode) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    // Check expiry
    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ error: "Reset code expired. Request a new one" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await User.updateOne(
      { _id: user._id },
      {
        password: hashed,
        resetCode: null,
        resetCodeExpiry: null
      }
    );

    return res.json({ message: "Password reset successful. Please log in." });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// GET USER PROFILE
// GET /api/auth/profile
// =========================================
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("email name");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name || ""
      }
    });

  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// UPDATE USER PROFILE
// PUT /api/auth/profile
// =========================================
router.put("/profile", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      { new: true }
    ).select("email name");

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// =========================================
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !currentPassword.trim()) {
      return res.status(400).json({ error: "Current password is required" });
    }
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ error: "New password is required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password cannot be the same as current password" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: req.userId },
      { password: hashed }
    );

    return res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;