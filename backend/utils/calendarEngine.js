// backend/utils/calendarEngine.js
// ========================================
// Underground Water 2 - Advanced Calendar Engine (Option C)
// ========================================
//
// This engine builds:
//  - Daily ledger (events + running balance)
//  - Monthly summary (income, expenses, net, end balance)
//  - Pressure points (heavy bill days)
//  - Year forecast (month-to-month chaining)
//
// Data sources:
//  - Recurring (income + expense)
//  - PaycheckSettings (extra recurring income stream)
//  - StartingBalance (base starting point)
//  - Transaction (optional: real transactions)
//
// NOTE: Frontend can call this through /api/calendar once we wire it.
// ========================================

import Recurring from "../models/Recurring.js";
import Transaction from "../models/Transaction.js";
import StartingBalance from "../models/StartingBalance.js";
import PaycheckSettings from "../models/PaycheckSettings.js";

// -----------------------------
// Helpers
// -----------------------------

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date) {
  return normalizeDate(date).toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Generate all occurrences of a recurring item between [startRange, endRange]
 * frequency: "weekly" | "biweekly" | "monthly"
 */
function generateOccurrences(startDate, startRange, endRange, frequency) {
  if (!startDate) return [];

  let occurrences = [];
  let current = normalizeDate(startDate);
  const rangeStart = normalizeDate(startRange);
  const rangeEnd = normalizeDate(endRange);

  // If starting before range, fast-forward
  while (current < rangeStart) {
    if (frequency === "weekly") {
      current = addDays(current, 7);
    } else if (frequency === "biweekly") {
      current = addDays(current, 14);
    } else if (frequency === "monthly") {
      current = addMonths(current, 1);
    } else {
      // unsupported frequency, bail out
      return [];
    }
  }

  // Collect dates within range
  while (current <= rangeEnd) {
    occurrences.push(normalizeDate(current));

    if (frequency === "weekly") {
      current = addDays(current, 7);
    } else if (frequency === "biweekly") {
      current = addDays(current, 14);
    } else if (frequency === "monthly") {
      current = addMonths(current, 1);
    } else {
      break;
    }
  }

  return occurrences;
}

// -----------------------------
// Core: Monthly Calendar
// -----------------------------

/**
 * Build an advanced monthly calendar.
 *
 * @param {string} userId - Mongo ObjectId as string
 * @param {number} year - e.g. 2025
 * @param {number} month - 1–12
 * @param {number|null} startingBalanceOverride - if provided, overrides DB starting balance
 *
 * Returns:
 * {
 *   year,
 *   month,
 *   startDate,
 *   endDate,
 *   startingBalance,
 *   days: [
 *     {
 *       date: Date,
 *       dateKey: "YYYY-MM-DD",
 *       day: 1-31,
 *       events: [
 *         { kind, name, amount, projected, source }
 *       ],
 *       incomeTotal,
 *       expenseTotal,
 *       endBalance
 *     }
 *   ],
 *   monthSummary: {
 *     totalIncome,
 *     totalExpenses,
 *     netChange,
 *     endBalance,
 *     lowestBalance,
 *     highestBalance
 *   },
 *   pressurePoints: [
 *     { dateKey, date, expenseTotal, endBalance }
 *   ]
 * }
 */
export async function buildMonthlyCalendar(
  userId,
  year,
  month,
  startingBalanceOverride = null
) {
  try {
    // Range of this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0); // last day of month
    const daysInMonth = endOfMonth.getDate();

    // Fetch all relevant data at once
    const [recurringItems, paycheckSettings, startingBalanceDoc, actualTx] =
      await Promise.all([
        Recurring.find({ userId }).catch(() => []), // income + expense, arbitrary names
        PaycheckSettings.findOne({ userId }).catch(() => null),
        StartingBalance.findOne({ userId }).catch(() => null),
        Transaction.find({
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        }).catch(() => []),
      ]);

    // Decide starting balance
    const baseStartingBalance =
      startingBalanceOverride != null
        ? Number(startingBalanceOverride)
        : startingBalanceDoc
        ? Number(startingBalanceDoc.startingBalance || 0)
        : 0;

    // Prepare day objects
    const days = [];
    const dayMap = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const key = dateKey(date);

    const dayObj = {
      date,
      dateKey: key,
      day: d,
      events: [], // { kind, name, amount, projected, source }
      incomeTotal: 0,
      expenseTotal: 0,
      endBalance: baseStartingBalance, // will be recalculated
    };

    days.push(dayObj);
    dayMap[key] = dayObj;
  }

  // Split recurring items by type
  const recurringIncome = recurringItems.filter((r) => r.type === "income");
  const recurringExpenses = recurringItems.filter((r) => r.type === "expense");

  // --------------------------------
  // Track actual transactions FIRST to know which dates have real income/expenses
  // --------------------------------
  const datesWithActualIncome = new Set();
  const datesWithActualExpense = new Set();
  
  for (const tx of actualTx) {
    const key = dateKey(tx.date);
    const amt = Number(tx.amount || 0);
    const isExpense = amt < 0;

    if (isExpense) {
      datesWithActualExpense.add(key);
    } else {
      datesWithActualIncome.add(key);
    }
  }

  // --------------------------------
  // Place recurring income (from Recurring model)
  // SKIP if this date already has actual income
  // --------------------------------
  for (const rec of recurringIncome) {
    const occurrences = generateOccurrences(
      rec.startDate,
      startOfMonth,
      endOfMonth,
      rec.frequency
    );

    for (const occ of occurrences) {
      const key = dateKey(occ);
      const day = dayMap[key];
      if (!day) continue;

      // Skip projected income if actual income exists for this date
      if (datesWithActualIncome.has(key)) {
        continue;
      }

      const amount = Number(rec.amount || 0);

      day.events.push({
        type: "income",
        name: rec.name,
        amount,
        projected: true,
        source: "recurring",
        recurringId: rec._id,
      });

      day.incomeTotal += amount;
    }
  }

  // --------------------------------
  // Place recurring expenses (from Recurring model)
  // SKIP if this date already has actual expenses
  // --------------------------------
  for (const rec of recurringExpenses) {
    const occurrences = generateOccurrences(
      rec.startDate,
      startOfMonth,
      endOfMonth,
      rec.frequency
    );

    for (const occ of occurrences) {
      const key = dateKey(occ);
      const day = dayMap[key];
      if (!day) continue;

      // Skip projected expense if actual expense exists for this date
      if (datesWithActualExpense.has(key)) {
        continue;
      }

      const amount = Number(rec.amount || 0);

      day.events.push({
        type: "expense",
        name: rec.name,
        amount,
        projected: true,
        source: "recurring",
        recurringId: rec._id,
      });

      day.expenseTotal += amount;
    }
  }

  // --------------------------------
  // Now overlay actual transactions
  // If actual income/expense, remove corresponding projected ones
  // --------------------------------
  for (const tx of actualTx) {
    const key = dateKey(tx.date);
    const day = dayMap[key];
    if (!day) continue;

    const amt = Number(tx.amount || 0);
    const isExpense = amt < 0;
    const absAmount = Math.abs(amt);

    // If this is actual income, remove all projected income from this day
    if (!isExpense) {
      const projectedIncome = day.events.filter(e => e.type === "income" && e.projected);
      for (const proj of projectedIncome) {
        day.incomeTotal -= proj.amount;
      }
      day.events = day.events.filter(e => !(e.type === "income" && e.projected));
    }
    // If this is actual expense, remove all projected expenses from this day
    else {
      const projectedExpenses = day.events.filter(e => e.type === "expense" && e.projected);
      for (const proj of projectedExpenses) {
        day.expenseTotal -= proj.amount;
      }
      day.events = day.events.filter(e => !(e.type === "expense" && e.projected));
    }

    day.events.push({
      type: isExpense ? "expense" : "income",
      name: tx.description,
      amount: absAmount,
      projected: false,
      source: "transaction",
      category: tx.category,
      _id: tx._id,
    });

    if (isExpense) {
      day.expenseTotal += absAmount;
    } else {
      day.incomeTotal += absAmount;
    }
  }

  // --------------------------------
  // Add paycheck settings as extra recurring income stream
  // BUT skip if this date already has actual income recorded
  // --------------------------------
  if (paycheckSettings && paycheckSettings.startDate && paycheckSettings.payAmount) {
    const occurrences = generateOccurrences(
      paycheckSettings.startDate,
      startOfMonth,
      endOfMonth,
      paycheckSettings.frequency || "biweekly"
    );

    for (const occ of occurrences) {
      const key = dateKey(occ);
      const day = dayMap[key];
      if (!day) continue;

      // Skip this projected paycheck if actual income already exists for this date
      if (datesWithActualIncome.has(key)) {
        continue;
      }

      const amount = Number(paycheckSettings.payAmount || 0);

      day.events.push({
        type: "income",
        name: "Paycheck",
        amount,
        projected: true,
        source: "paycheckSettings",
        paycheckSettingsId: paycheckSettings._id,
      });

      day.incomeTotal += amount;
    }
  }

  // --------------------------------
  // Compute running balance
  // --------------------------------
  let runningBalance = baseStartingBalance;
  let lowestBalance = baseStartingBalance;
  let highestBalance = baseStartingBalance;

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const day of days) {
    totalIncome += day.incomeTotal;
    totalExpenses += day.expenseTotal;

    runningBalance = runningBalance + day.incomeTotal - day.expenseTotal;
    day.endBalance = runningBalance;

    if (runningBalance < lowestBalance) lowestBalance = runningBalance;
    if (runningBalance > highestBalance) highestBalance = runningBalance;
  }

  const monthSummary = {
    totalIncome,
    totalExpenses,
    netChange: totalIncome - totalExpenses,
    endBalance: runningBalance,
    lowestBalance,
    highestBalance,
  };

  // --------------------------------
  // Pressure points: pick top 3 highest expense days
  // --------------------------------
  const pressurePoints = [...days]
    .filter((d) => d.expenseTotal > 0)
    .sort((a, b) => b.expenseTotal - a.expenseTotal)
    .slice(0, 3)
    .map((d) => ({
      dateKey: d.dateKey,
      date: d.date,
      expenseTotal: d.expenseTotal,
      endBalance: d.endBalance,
    }));

    return {
      year,
      month,
      startDate: startOfMonth,
      endDate: endOfMonth,
      startingBalance: baseStartingBalance,
      days,
      summary: {
        startingBalance: baseStartingBalance,
        income: monthSummary.totalIncome,
        expenses: monthSummary.totalExpenses,
        endingBalance: monthSummary.endBalance,
        lowestBalance: monthSummary.lowestBalance,
        highestBalance: monthSummary.highestBalance,
      },
      pressurePoints: pressurePoints.map(p => ({
        date: p.dateKey,
        balance: p.expenseTotal,
      })),
    };
  } catch (err) {
    console.error("Error building monthly calendar:", err.message);
    throw err;
  }
}

// -----------------------------
// Year Forecast
// -----------------------------

/**
 * Build a chained year forecast:
 *  - Month 1 starts from DB starting balance (or override)
 *  - Each following month starts from previous month’s end balance
 *
 * Returns:
 * {
 *   year,
 *   months: [ monthlyCalendar, ... ],
 *   summary: {
 *     totalIncome,
 *     totalExpenses,
 *     netChange,
 *     endBalance,
 *     lowestBalance,
 *     highestBalance
 *   }
 * }
 */
export async function buildYearForecast(userId, year, startingBalanceOverride = null) {
  const months = [];
  let currentStartBalanceOverride = startingBalanceOverride;
  let globalTotalIncome = 0;
  let globalTotalExpenses = 0;
  let globalLowest = null;
  let globalHighest = null;
  let finalEndBalance = 0;

  for (let m = 1; m <= 12; m++) {
    const monthCal = await buildMonthlyCalendar(
      userId,
      year,
      m,
      currentStartBalanceOverride
    );

    months.push(monthCal);

    const ms = monthCal.monthSummary;
    globalTotalIncome += ms.totalIncome;
    globalTotalExpenses += ms.totalExpenses;
    finalEndBalance = ms.endBalance;

    if (globalLowest === null || ms.lowestBalance < globalLowest) {
      globalLowest = ms.lowestBalance;
    }
    if (globalHighest === null || ms.highestBalance > globalHighest) {
      globalHighest = ms.highestBalance;
    }

    // Next month starts from this month's end balance
    currentStartBalanceOverride = ms.endBalance;
  }

  const summary = {
    totalIncome: globalTotalIncome,
    totalExpenses: globalTotalExpenses,
    netChange: globalTotalIncome - globalTotalExpenses,
    endBalance: finalEndBalance,
    lowestBalance: globalLowest ?? 0,
    highestBalance: globalHighest ?? 0,
  };

  return {
    year,
    months,
    summary,
  };
}