import express from "express";
import Category from "../models/Category.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get categories for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post("/", authMiddleware, async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
      userId: req.userId,
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
