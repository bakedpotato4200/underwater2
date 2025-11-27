// backend/routes/billRoutes.js
// ========================================
// Underground Water 2 - Bill Routes
// ========================================

import express from "express";
import Bill from "../models/Bill.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ========================================
// GET ALL BILLS FOR THE USER
// GET /api/bills
// ========================================
router.get("/", auth, async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.userId });
    res.json(bills);
  } catch (err) {
    console.error("Get bills error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// CREATE A NEW BILL
// POST /api/bills
// ========================================
router.post("/", auth, async (req, res) => {
  try {
    const bill = await Bill.create({
      ...req.body,
      userId: req.userId,
    });

    res.json(bill);
  } catch (err) {
    console.error("Create bill error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// UPDATE A BILL
// PUT /api/bills/:id
// ========================================
router.put("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    res.json(bill);
  } catch (err) {
    console.error("Update bill error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// DELETE A BILL
// DELETE /api/bills/:id
// ========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Bill.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ message: "Bill deleted" });
  } catch (err) {
    console.error("Delete bill error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;