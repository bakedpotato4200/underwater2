// backend/routes/startingBalanceRoutes.js
// ========================================
// Underground Water 2 - Starting Balance Routes
// ========================================

import express from "express";
import StartingBalance from "../models/StartingBalance.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ========================================
// GET STARTING BALANCE
// GET /api/starting-balance
// ========================================
router.get("/", auth, async (req, res) => {
  try {
    const record = await StartingBalance.findOne({ userId: req.userId });

    res.json({
      startingBalance: record ? record.startingBalance : 0
    });
  } catch (err) {
    console.error("Get starting balance error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// SET STARTING BALANCE
// POST /api/starting-balance
// ========================================
router.post("/", auth, async (req, res) => {
  try {
    const { startingBalance } = req.body;

    const updated = await StartingBalance.findOneAndUpdate(
      { userId: req.userId },
      { startingBalance },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Set starting balance error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;