// backend/routes/categoryRoutes.js
// ========================================
// Underground Water 2 - Category Routes
// ========================================

import express from "express";
import Category from "../models/Category.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ========================================
// GET CATEGORIES FOR USER
// GET /api/categories
// ========================================
router.get("/", auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json(categories);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// CREATE CATEGORY
// POST /api/categories
// ========================================
router.post("/", auth, async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
      userId: req.userId,
    });

    res.json(category);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// ========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;