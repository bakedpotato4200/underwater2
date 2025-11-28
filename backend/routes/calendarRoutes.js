// backend/routes/calendarRoutes.js
// ========================================
// Underground Water 2 - Calendar API Routes
// Connects backend logic to the advanced calendar engine
// ========================================

import express from "express";
import auth from "../middleware/auth.js";

import {
  buildMonthlyCalendar,
  buildYearForecast
} from "../utils/calendarEngine.js";   // ✅ Correct path

const router = express.Router();

/**
 * GET /api/calendar/month?year=2025&month=1
 *
 * Returns a full advanced monthly projection:
 *  - Day events
 *  - Running balance
 *  - Month summary
 *  - Pressure points
 */
router.get("/month", auth, async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    if (!year || !month) {
      return res.status(400).json({ error: "Missing year or month" });
    }

    const calendar = await buildMonthlyCalendar(req.userId, year, month);
    res.json(calendar);
  } catch (err) {
    console.error("Calendar /month error:", err.message, err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/**
 * GET /api/calendar/year?year=2025
 *
 * Returns:
 *  - 12 chained monthly projections
 *  - Annual summary
 */
router.get("/year", auth, async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    if (!year) {
      return res.status(400).json({ error: "Missing year" });
    }

    const forecast = await buildYearForecast(req.userId, year);
    res.json(forecast);
  } catch (err) {
    console.error("Calendar /year error:", err.message, err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;