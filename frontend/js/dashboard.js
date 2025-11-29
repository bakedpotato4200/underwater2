// frontend/js/dashboard.js
// ========================================
// Under Water 2 - Dashboard
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

// Modal elements (shared with calendar)
const dayModal = document.getElementById("day-detail-modal");
const dayModalContent = document.getElementById("day-modal-content");
const dayModalClose = document.getElementById("day-modal-close");

// Active date range
let activeYear = nowYear();
let activeMonth = nowMonth();
let currentMonthData = null;

// ========================================
// Load dashboard summary (current month)
// Called by ui.js → showView("dashboard-view")
// ========================================
export async function loadDashboard() {
  dashPressureList.innerHTML = "";
  console.log(`📊 Loading dashboard for ${activeYear}-${activeMonth}...`);

  try {
    const data = await apiGetMonthlyCalendar(activeYear, activeMonth);
    console.log("✅ Dashboard data received:", data);
    renderDashboard(data);
  } catch (err) {
    console.error("❌ Dashboard load error:", err);
    dashPressureList.innerHTML = `<li style="color: red;">Error loading dashboard: ${err.message}</li>`;
  }
}

// ========================================
// Render Dashboard UI
// ========================================
function renderDashboard(data) {
  const { summary, pressurePoints, days } = data;
  
  // Store full month data for modal interactions
  currentMonthData = data;

  // Summary values
  dashStartingBal.textContent = formatMoney(summary.startingBalance);
  dashIncome.textContent = formatMoney(summary.income);
  dashExpenses.textContent = formatMoney(summary.expenses);
  dashEndBal.textContent = formatMoney(summary.endingBalance);

  dashLowest.textContent = formatMoney(summary.lowestBalance);
  dashHighest.textContent = formatMoney(summary.highestBalance);

  // Pressure points list
  if (pressurePoints && pressurePoints.length > 0) {
    pressurePoints.forEach((p, idx) => {
      const li = document.createElement("li");
      const indicator = idx === 0 ? "🔴" : idx === 1 ? "🟠" : "🟡";
      const formattedDate = formatPressureDate(p.date);
      li.innerHTML = `<strong>${indicator} ${formattedDate}</strong><br><small>${formatMoney(p.balance)}</small>`;
      
      // Make clickable to show day details
      li.style.cursor = "pointer";
      li.addEventListener("click", () => showPressureDayDetails(p.date, days));
      
      dashPressureList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "✓ No pressure days this month.";
    li.style.color = "var(--success-green)";
    dashPressureList.appendChild(li);
  }
}

// ========================================
// Format date for pressure days
// Converts "2025-11-21" to "11-21-2025 (Friday)"
// ========================================
function formatPressureDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00Z");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  const dayName = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `${month}-${day}-${year} (${dayName})`
}

// ========================================
// Show Pressure Day Details Modal
// ========================================
function showPressureDayDetails(dateStr, days) {
  if (!dayModal || !dayModalContent) {
    console.error("Modal elements not found");
    return;
  }

  // Find the day object by dateKey
  const day = days.find(d => d.dateKey === dateStr);
  if (!day) {
    console.error("Day not found:", dateStr);
    return;
  }

  const date = new Date(day.date);
  const dateFormatted = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  let html = `<h3>${dateFormatted}</h3>`;
  html += `<div class="day-detail-section">`;
  html += `<p><strong>Starting Balance:</strong> ${formatMoney(day.startBalance || 0)}</p>`;

  if (day.events && day.events.length > 0) {
    html += `<div class="day-events">`;
    html += `<h4>Transactions:</h4>`;
    day.events.forEach((event, idx) => {
      if (event.type === "income") {
        html += `<div class="detail-income" style="cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s;" data-income-idx="${idx}" data-income-name="${event.name}" data-income-amount="${event.amount}">✓ ${event.name}: <strong>+${formatMoney(event.amount)}</strong></div>`;
      } else {
        html += `<div class="detail-expense">✗ ${event.name}: <strong>-${formatMoney(event.amount)}</strong></div>`;
      }
    });
    html += `</div>`;
  } else {
    html += `<p><em>No transactions this day</em></p>`;
  }

  html += `<div class="day-totals">`;
  html += `<p><strong>Income:</strong> <span style="color: #2ecc71">+${formatMoney(day.incomeTotal || 0)}</span></p>`;
  html += `<p><strong>Expenses:</strong> <span style="color: #e74c3c">-${formatMoney(day.expenseTotal || 0)}</span></p>`;
  html += `<p style="border-top: 1px solid #ccc; padding-top: 0.5rem; margin-top: 0.5rem;"><strong>End of Day Balance:</strong> <span style="font-size: 1.2rem; font-weight: bold">${formatMoney(day.endBalance)}</span></p>`;
  html += `</div>`;

  dayModalContent.innerHTML = html;
  dayModal.classList.add("modal-visible");
}