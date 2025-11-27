// backend/routes/transactionRoutes.js
// ========================================
// Underground Water 2 - Transaction Routes
// ========================================

import express from "express";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ========================================
// GET ALL TRANSACTIONS FOR USER
// GET /api/transactions
// ========================================
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// CREATE A NEW TRANSACTION
// POST /api/transactions
// ========================================
router.post("/", auth, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      userId: req.userId,
    });

    res.json(transaction);
  } catch (err) {
    console.error("Create transaction error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// DELETE A TRANSACTION
// DELETE /api/transactions/:id
// ========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;