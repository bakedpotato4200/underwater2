// backend/routes/recurringRoutes.js
// ========================================
// Underground Water 2 - Recurring Items
// Handles recurring bills & recurring income.
// ========================================

import express from "express";
import Recurring from "../models/Recurring.js";  // NEW clean model
import auth from "../middleware/auth.js";

const router = express.Router();

// ========================================
// GET ALL RECURRING ITEMS (bills + income)
// GET /api/recurring
// ========================================
router.get("/", auth, async (req, res) => {
  try {
    const items = await Recurring.find({ userId: req.userId });
    res.json(items);
  } catch (err) {
    console.error("Get recurring error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// CREATE RECURRING ITEM
// POST /api/recurring
// ========================================
router.post("/", auth, async (req, res) => {
  try {
    const item = await Recurring.create({
      ...req.body,
      userId: req.userId,
    });

    res.json(item);
  } catch (err) {
    console.error("Create recurring error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// UPDATE RECURRING ITEM
// PUT /api/recurring/:id
// ========================================
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Recurring.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Update recurring error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// DELETE RECURRING ITEM
// DELETE /api/recurring/:id
// ========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Recurring.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ message: "Recurring item deleted" });
  } catch (err) {
    console.error("Delete recurring error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;