import express from "express";
import RecurringTransaction from "../models/recurringTransaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL RECURRING TRANSACTIONS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const recurringItems = await RecurringTransaction.find({ userId: req.user.id });
    res.json(recurringItems);
  } catch (error) {
    console.error("Error fetching recurring:", error);
    res.status(500).json({ message: "Server error fetching recurring transactions" });
  }
});

// CREATE RECURRING
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newRecurring = new RecurringTransaction({
      ...req.body,
      userId: req.user.id,
    });

    await newRecurring.save();
    res.json(newRecurring);
  } catch (error) {
    console.error("Error creating recurring:", error);
    res.status(500).json({ message: "Server error creating recurring transaction" });
  }
});

// DELETE RECURRING
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    res.json({ message: "Recurring transaction deleted" });
  } catch (error) {
    console.error("Error deleting recurring:", error);
    res.status(500).json({ message: "Server error deleting recurring transaction" });
  }
});

export default router;
