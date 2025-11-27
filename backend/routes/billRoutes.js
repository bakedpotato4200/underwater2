import express from "express";
import Bill from "../models/Bill.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * GET ALL BILLS FOR USER
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.userId });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CREATE A NEW BILL
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.create({
      ...req.body,
      userId: req.userId,
    });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE BILL
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE BILL
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Bill.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
