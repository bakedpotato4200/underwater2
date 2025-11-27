// backend/utils/calendarEngine.js

import Recurring from "../models/Recurring.js";
import RecurringTransaction from "../models/recurringTransaction.js";
import Transaction from "../models/Transaction.js";
import Bill from "../models/Bill.js";

/**
 * Generate a full calendar model for a given user/month/year
 * Includes:
 *  - projected recurring bills
 *  - projected recurring income
 *  - actual transactions when they exist
 *  - end balance per day
 *  - red/green dots for bills & income
 */
export async function buildCalendar(userId, year, month, startingBalance = 0) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month
    const daysInMonth = endDate.getDate();

    // --- GET RECURRING ITEMS ---
    const recurringBills = await Recurring.find({ userId, type: "bill" });
    const recurringIncome = await Recurring.find({ userId, type: "income" });

    // --- GET ACTUAL TRANSACTIONS (REAL MONEY MOVEMENTS) ---
    const realTransactions = await Transaction.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    });

    // Build day-by-day structure
    let calendar = {};
    let runningBalance = startingBalance;

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const key = date.toISOString().split("T")[0];

        calendar[key] = {
            date: key,
            bills: [],
            income: [],
            actual: [],
            endBalance: runningBalance,
            hasBill: false,
            hasIncome: false
        };
    }

    // --- PLACE RECURRING BILLS ---
    recurringBills.forEach(rec => {
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month - 1, d);
            if (date.getDate() === rec.dayOfMonth) {
                const key = date.toISOString().split("T")[0];
                calendar[key].bills.push({
                    name: rec.name,
                    amount: rec.amount,
                    projected: true
                });
                calendar[key].hasBill = true;
            }
        }
    });

    // --- PLACE RECURRING INCOME ---
    recurringIncome.forEach(rec => {
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month - 1, d);
            if (date.getDate() === rec.dayOfMonth) {
                const key = date.toISOString().split("T")[0];
                calendar[key].income.push({
                    name: rec.name,
                    amount: rec.projectedAmount,
                    projected: true
                });
                calendar[key].hasIncome = true;
            }
        }
    });

    // --- PLACE ACTUAL TRANSACTIONS (Overrides projected) ---
    realTransactions.forEach(tx => {
        const key = tx.date.toISOString().split("T")[0];

        if (calendar[key]) {
            // Expense
            if (tx.amount < 0) {
                calendar[key].bills.push({
                    name: tx.description,
                    amount: Math.abs(tx.amount),
                    projected: false
                });
                calendar[key].hasBill = true;
            } else {
                // Income
                calendar[key].income.push({
                    name: tx.description,
                    amount: tx.amount,
                    projected: false
                });
                calendar[key].hasIncome = true;
            }

            calendar[key].actual.push(tx);
        }
    });

    // --- CALCULATE RUNNING BALANCE ---
    runningBalance = startingBalance;

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const key = date.toISOString().split("T")[0];

        let day = calendar[key];

        let billTotal = day.bills.reduce((sum, b) => sum + b.amount, 0);
        let incomeTotal = day.income.reduce((sum, i) => sum + i.amount, 0);

        runningBalance = runningBalance + incomeTotal - billTotal;
        day.endBalance = runningBalance;
    }

    return calendar;
}
