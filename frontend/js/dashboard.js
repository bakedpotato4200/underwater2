// frontend/js/dashboard.js
// ========================================
// Underground Water 2 - Dashboard
// Shows monthly summary + pressure days
// ========================================

import { apiGetMonthlyCalendar } from "./api.js";
import { nowMonth, nowYear, formatMoney } from "./config.js";

// DOM Elements
const dashStartingBal = document.getElementById("dash-starting-balance");
const dashIncome = document.getElementById("dash-income");
const dashExpenses = document.getElementById("dash-expenses");
const dashEndBal = document.getElementById("dash-end-balance");
const dashLowest = document.getElementById("dash-lowest-balance");
const dashHighest = document.getElementById("dash-highest-balance");
const dashPressureList = document.getElementById("dash-pressure-days");

// Active date range
let activeYear = nowYear();
let activeMonth = nowMonth();

// ========================================
// Load dashboard summary (current month)
// Called by ui.js → showView("dashboard-view")
// ========================================
export async function loadDashboard() {
  dashPressureList.innerHTML = "";

  try {
    const data = await apiGetMonthlyCalendar(activeYear, activeMonth);
    renderDashboard(data);
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// ========================================
// Render Dashboard UI
// ========================================
function renderDashboard(data) {
  const { summary, pressurePoints } = data;

  // Summary values
  dashStartingBal.textContent = formatMoney(summary.startingBalance);
  dashIncome.textContent = formatMoney(summary.income);
  dashExpenses.textContent = formatMoney(summary.expenses);
  dashEndBal.textContent = formatMoney(summary.endingBalance);

  dashLowest.textContent = formatMoney(summary.lowestBalance);
  dashHighest.textContent = formatMoney(summary.highestBalance);

  // Pressure points list
  if (pressurePoints && pressurePoints.length > 0) {
    pressurePoints.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.date} → ${formatMoney(p.balance)}`;
      dashPressureList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No pressure days this month.";
    dashPressureList.appendChild(li);
  }
}