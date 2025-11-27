import express from "express";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all transactions for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new transaction
router.post("/", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      userId: req.userId,
    });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
