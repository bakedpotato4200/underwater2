// frontend/js/dashboard.js
// ========================================
// Under Water 2 - Dashboard
// Shows monthly summary + pressure days
// ========================================

import { apiGetMonthlyCalendar, apiDeleteTransaction } from "./api.js";
import { nowMonth, nowYear, formatMoney } from "./config.js";

// DOM Elements
const dashIncome = document.getElementById("dash-income");
const dashIncomeCard = document.getElementById("dash-income-card");
const dashExpenses = document.getElementById("dash-expenses");
const dashExpensesCard = document.getElementById("dash-expenses-card");
const dashEndBal = document.getElementById("dash-end-balance");
const dashPaycheck1 = document.getElementById("dash-paycheck-1");
const dashPaycheck1Detail = document.getElementById("dash-paycheck-1-detail");
const dashPaycheck2 = document.getElementById("dash-paycheck-2");
const dashPaycheck2Detail = document.getElementById("dash-paycheck-2-detail");
const dashPaycheck1Card = document.getElementById("dash-paycheck-1-card");
const dashPaycheck2Card = document.getElementById("dash-paycheck-2-card");
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
  dashIncome.textContent = formatMoney(summary.income);
  dashExpenses.textContent = formatMoney(summary.expenses);
  dashEndBal.textContent = formatMoney(summary.endingBalance);

  // Calculate paycheck periods (first 14 days and days 15-31)
  const monthStart = new Date(activeYear, activeMonth - 1, 1);
  const monthEnd = new Date(activeYear, activeMonth, 0);
  const period1Start = new Date(activeYear, activeMonth - 1, 1);
  const period1End = new Date(activeYear, activeMonth - 1, 14);
  const period2Start = new Date(activeYear, activeMonth - 1, 15);
  const period2End = monthEnd;

  // Calculate paycheck totals for each period
  let paycheck1Total = 0;
  let paycheck1Bills = 0;
  let paycheck1Income = 0;
  let paycheck2Total = 0;
  let paycheck2Bills = 0;
  let paycheck2Income = 0;

  if (days && days.length > 0) {
    days.forEach(day => {
      const dayDate = new Date(day.date);
      
      // Period 1 (days 1-14)
      if (dayDate >= period1Start && dayDate <= period1End && day.events) {
        // For income: only count one per day (prefer actual over projected)
        const paycheckIncomes = day.events.filter(e => e.type === "income" && e.name && e.name.toLowerCase().includes("paycheck"));
        const otherIncomes = day.events.filter(e => e.type === "income" && (!e.name || !e.name.toLowerCase().includes("paycheck")));
        
        if (paycheckIncomes.length > 0) {
          const hasActual = paycheckIncomes.some(e => !e.projected);
          const incomeToCount = hasActual ? paycheckIncomes.find(e => !e.projected) : paycheckIncomes[0];
          paycheck1Total += incomeToCount.amount || 0;
        }
        
        if (otherIncomes.length > 0) {
          const hasActual = otherIncomes.some(e => !e.projected);
          const incomeToCount = hasActual ? otherIncomes.find(e => !e.projected) : otherIncomes[0];
          paycheck1Income += incomeToCount.amount || 0;
        }
        
        // For expenses: only count one per day (prefer actual over projected)
        const expenses = day.events.filter(e => e.type === "expense");
        if (expenses.length > 0) {
          const hasActual = expenses.some(e => !e.projected);
          const expenseToCount = hasActual ? expenses.find(e => !e.projected) : expenses[0];
          paycheck1Bills += expenseToCount.amount || 0;
        }
      }
      // Period 2 (days 15-31)
      if (dayDate >= period2Start && dayDate <= period2End && day.events) {
        // For income: only count one per day (prefer actual over projected)
        const paycheckIncomes = day.events.filter(e => e.type === "income" && e.name && e.name.toLowerCase().includes("paycheck"));
        const otherIncomes = day.events.filter(e => e.type === "income" && (!e.name || !e.name.toLowerCase().includes("paycheck")));
        
        if (paycheckIncomes.length > 0) {
          const hasActual = paycheckIncomes.some(e => !e.projected);
          const incomeToCount = hasActual ? paycheckIncomes.find(e => !e.projected) : paycheckIncomes[0];
          paycheck2Total += incomeToCount.amount || 0;
        }
        
        if (otherIncomes.length > 0) {
          const hasActual = otherIncomes.some(e => !e.projected);
          const incomeToCount = hasActual ? otherIncomes.find(e => !e.projected) : otherIncomes[0];
          paycheck2Income += incomeToCount.amount || 0;
        }
        
        // For expenses: only count one per day (prefer actual over projected)
        const expenses = day.events.filter(e => e.type === "expense");
        if (expenses.length > 0) {
          const hasActual = expenses.some(e => !e.projected);
          const expenseToCount = hasActual ? expenses.find(e => !e.projected) : expenses[0];
          paycheck2Bills += expenseToCount.amount || 0;
        }
      }
    });
  }

  dashPaycheck1.textContent = `-${formatMoney(paycheck1Bills)}`;
  dashPaycheck1Detail.textContent = ``;
  dashPaycheck2.textContent = `-${formatMoney(paycheck2Bills)}`;
  dashPaycheck2Detail.textContent = ``;

  // Add click handlers for cards
  dashIncomeCard.onclick = () => showMonthlyIncomeDetails(days);
  dashExpensesCard.onclick = () => showMonthlyExpensesDetails(days);
  dashPaycheck1Card.onclick = () => showPaycheckDetails(1, period1Start, period1End, days, paycheck1Total, paycheck1Bills, paycheck1Income);
  dashPaycheck2Card.onclick = () => showPaycheckDetails(2, period2Start, period2End, days, paycheck2Total, paycheck2Bills, paycheck2Income);

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
        html += `<div class="detail-income" style="padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin: 0.25rem 0;">
          <span>✓ ${event.name}: <strong>+${formatMoney(event.amount)}</strong></span>
          <button style="background: #e74c3c; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.85rem;" data-delete-tx="${event._id || 'N/A'}">Delete</button>
        </div>`;
      } else {
        html += `<div class="detail-expense" style="padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin: 0.25rem 0;">
          <span>✗ ${event.name}: <strong>-${formatMoney(event.amount)}</strong></span>
          <button style="background: #e74c3c; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.85rem;" data-delete-tx="${event._id || 'N/A'}">Delete</button>
        </div>`;
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
  
  // Add delete button event listeners
  setTimeout(() => {
    const deleteButtons = dayModalContent.querySelectorAll("[data-delete-tx]");
    deleteButtons.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const txId = btn.getAttribute("data-delete-tx");
        if (txId && txId !== "N/A" && confirm("Are you sure you want to delete this transaction?")) {
          await deleteTransactionItem(txId);
        }
      });
    });
  }, 0);
}

// ========================================
// Show Paycheck Details Modal
// ========================================
function showPaycheckDetails(paycheckNum, periodStart, periodEnd, days, totalPaycheck, totalBills, otherIncome) {
  if (!dayModal || !dayModalContent) {
    console.error("Modal elements not found");
    return;
  }

  const startFormatted = periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFormatted = periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  let html = `<h3>Paycheck ${paycheckNum} (${startFormatted} - ${endFormatted})</h3>`;
  html += `<div class="day-detail-section">`;
  
  // Show all income for the period
  html += `<h4 style="margin-bottom: 0.5rem;">Income for this Period:</h4>`;
  let foundIncome = false;
  let totalPeriodIncome = 0;

  if (days && days.length > 0) {
    days.forEach(day => {
      const dayDate = new Date(day.date);
      
      // Check if day is in this period
      if (dayDate >= periodStart && dayDate <= periodEnd && day.events) {
        day.events.forEach(event => {
          if (event.type === "income") {
            foundIncome = true;
            totalPeriodIncome += event.amount || 0;
            const dayFormatted = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
            html += `<div class="detail-income" style="padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px;">
              <small style="color: #999;">${dayFormatted}</small> - ${event.name}: <strong style="color: #2ecc71;">+${formatMoney(event.amount)}</strong>
            </div>`;
          }
        });
      }
    });
  }

  if (!foundIncome) {
    html += `<p><em style="color: #999;">No income this period</em></p>`;
  }

  html += `<h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">Bills for this Period:</h4>`;

  let billCount = 0;
  let foundBills = false;

  if (days && days.length > 0) {
    days.forEach(day => {
      const dayDate = new Date(day.date);
      
      // Check if day is in this period
      if (dayDate >= periodStart && dayDate <= periodEnd && day.events) {
        day.events.forEach(event => {
          if (event.type === "expense") {
            foundBills = true;
            const dayFormatted = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
            html += `<div class="detail-expense" style="padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px;">
              <small style="color: #999;">${dayFormatted}</small> - ${event.name}: <strong style="color: #e74c3c;">-${formatMoney(event.amount)}</strong>
            </div>`;
            billCount++;
          }
        });
      }
    });
  }

  if (!foundBills) {
    html += `<p><em style="color: #2ecc71;">✓ No bills this period</em></p>`;
  }

  html += `<div class="day-totals" style="border-top: 1px solid #ccc; padding-top: 1rem; margin-top: 1rem;">`;
  html += `<p><strong>Total Income:</strong> <span style="color: #2ecc71;">+${formatMoney(totalPeriodIncome)}</span></p>`;
  html += `<p><strong>Total Bills:</strong> <span style="color: #e74c3c;">-${formatMoney(totalBills)}</span></p>`;
  html += `<p style="font-size: 1.2rem; margin-top: 0.5rem;"><strong>Income After Bills:</strong> <span style="color: ${totalPeriodIncome - totalBills >= 0 ? '#2ecc71' : '#e74c3c'}; font-size: 1.3rem;">${formatMoney(totalPeriodIncome - totalBills)}</span></p>`;
  html += `</div>`;
  html += `</div>`;

  dayModalContent.innerHTML = html;
  dayModal.classList.add("modal-visible");
}

// ========================================
// Show Monthly Income Details Modal
// ========================================
function showMonthlyIncomeDetails(days) {
  if (!dayModal || !dayModalContent) {
    console.error("Modal elements not found");
    return;
  }

  const monthName = new Date(activeYear, activeMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let html = `<h3>Income for ${monthName}</h3>`;
  html += `<div class="day-detail-section">`;

  let totalIncome = 0;
  let foundIncome = false;
  const daysWithActualIncome = new Set();

  // First pass: identify which days have actual income
  if (days && days.length > 0) {
    days.forEach(day => {
      if (day.events) {
        day.events.forEach(event => {
          if (event.type === "income" && !event.projected) {
            daysWithActualIncome.add(day.dateKey);
          }
        });
      }
    });
  }

  // Second pass: display income (only one per day - prefer actual over projected)
  if (days && days.length > 0) {
    days.forEach(day => {
      if (day.events) {
        // For each day, find income events and only show actual if it exists
        const incomeEvents = day.events.filter(e => e.type === "income");
        if (incomeEvents.length > 0) {
          // If there's actual income, only show actual. Otherwise show projected.
          const hasActual = incomeEvents.some(e => !e.projected);
          const eventToShow = hasActual 
            ? incomeEvents.find(e => !e.projected) 
            : incomeEvents[0];

          if (eventToShow) {
            foundIncome = true;
            totalIncome += eventToShow.amount || 0;
            const dayDate = new Date(day.date);
            const dayFormatted = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
            html += `<div class="detail-income" style="padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px;">
              <small style="color: #999;">${dayFormatted}</small> - ${eventToShow.name}: <strong style="color: #2ecc71;">+${formatMoney(eventToShow.amount)}</strong>
            </div>`;
          }
        }
      }
    });
  }

  if (!foundIncome) {
    html += `<p><em style="color: #999;">No income recorded this month</em></p>`;
  }

  html += `<div class="day-totals" style="border-top: 1px solid #ccc; padding-top: 1rem; margin-top: 1rem;">`;
  html += `<p style="font-size: 1.2rem;"><strong>Total Income:</strong> <span style="color: #2ecc71; font-size: 1.3rem;">${formatMoney(totalIncome)}</span></p>`;
  html += `</div>`;
  html += `</div>`;

  dayModalContent.innerHTML = html;
  dayModal.classList.add("modal-visible");
}

// ========================================
// Show Monthly Expenses Details Modal
// ========================================
function showMonthlyExpensesDetails(days) {
  if (!dayModal || !dayModalContent) {
    console.error("Modal elements not found");
    return;
  }

  const monthName = new Date(activeYear, activeMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let html = `<h3>Bills for ${monthName}</h3>`;
  html += `<div class="day-detail-section">`;

  let totalExpenses = 0;
  let foundExpenses = false;

  // Display expenses (only one per day - prefer actual over projected)
  if (days && days.length > 0) {
    days.forEach(day => {
      if (day.events) {
        // For each day, find expense events and only show actual if it exists
        const expenseEvents = day.events.filter(e => e.type === "expense");
        if (expenseEvents.length > 0) {
          // If there's actual expense, only show actual. Otherwise show projected.
          const hasActual = expenseEvents.some(e => !e.projected);
          const eventToShow = hasActual 
            ? expenseEvents.find(e => !e.projected) 
            : expenseEvents[0];

          if (eventToShow) {
            foundExpenses = true;
            totalExpenses += eventToShow.amount || 0;
            const dayDate = new Date(day.date);
            const dayFormatted = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
            html += `<div class="detail-expense" style="padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px;">
              <small style="color: #999;">${dayFormatted}</small> - ${eventToShow.name}: <strong style="color: #e74c3c;">-${formatMoney(eventToShow.amount)}</strong>
            </div>`;
          }
        }
      }
    });
  }

  if (!foundExpenses) {
    html += `<p><em style="color: #999;">No bills recorded this month</em></p>`;
  }

  html += `<div class="day-totals" style="border-top: 1px solid #ccc; padding-top: 1rem; margin-top: 1rem;">`;
  html += `<p style="font-size: 1.2rem;"><strong>Total Bills:</strong> <span style="color: #e74c3c; font-size: 1.3rem;">-${formatMoney(totalExpenses)}</span></p>`;
  html += `</div>`;
  html += `</div>`;

  dayModalContent.innerHTML = html;
  dayModal.classList.add("modal-visible");
}

// ========================================
// Delete Transaction Item
// ========================================
async function deleteTransactionItem(txId) {
  try {
    console.log(`🗑️ Deleting transaction: ${txId}`);
    await apiDeleteTransaction(txId);
    console.log("✅ Transaction deleted");
    
    // Reload the dashboard to reflect changes
    dayModal.classList.remove("modal-visible");
    loadDashboard();
  } catch (err) {
    console.error("❌ Delete transaction error:", err);
    alert("Failed to delete transaction");
  }
}