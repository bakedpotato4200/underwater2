// backend/routes/paycheckSettingsRoutes.js
// ========================================
// Underground Water 2 - Paycheck Settings Routes
// ========================================

import express from "express";
import PaycheckSettings from "../models/PaycheckSettings.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ========================================
// GET PAYCHECK SETTINGS
// GET /api/paycheck-settings
// ========================================
router.get("/", auth, async (req, res) => {
  try {
    const record = await PaycheckSettings.findOne({ userId: req.userId });

    if (!record) {
      return res.json({
        payAmount: 0,
        frequency: "biweekly",
        startDate: null
      });
    }

    res.json(record);
  } catch (err) {
    console.error("Get paycheck settings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// SAVE / UPDATE PAYCHECK SETTINGS
// POST /api/paycheck-settings
// ========================================
router.post("/", auth, async (req, res) => {
  try {
    const { payAmount, frequency, startDate } = req.body;

    const updated = await PaycheckSettings.findOneAndUpdate(
      { userId: req.userId },
      { payAmount, frequency, startDate },
      { new: true, upsert: true }
    );

    res.status(201).json(updated);
  } catch (err) {
    console.error("Save paycheck settings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// DELETE PAYCHECK SETTINGS
// DELETE /api/paycheck-settings/:id
// ========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await PaycheckSettings.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ error: "Paycheck settings not found" });
    }

    res.json({ message: "Paycheck settings deleted" });
  } catch (err) {
    console.error("Delete paycheck settings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;