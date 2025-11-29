// frontend/js/calendar.js
// ========================================
// Under Water 2 - Calendar Page Logic
// Loads monthly calendar + renders grid + summary
// ========================================

import {
  apiGetMonthlyCalendar,
  apiDeleteTransaction,
  apiDeleteRecurring,
  apiDeletePaycheck
} from "./api.js";

import {
  formatMoney,
  nowMonth,
  nowYear
} from "./config.js";

// Elements
const calendarGrid = document.getElementById("calendar-grid");
const calendarMonthLabel = document.getElementById("calendar-month-label");

const calIncomeLabel = document.getElementById("cal-income");
const calExpensesLabel = document.getElementById("cal-expenses");
const calNetLabel = document.getElementById("cal-net");

const prevMonthBtn = document.getElementById("prev-month-btn");
const nextMonthBtn = document.getElementById("next-month-btn");

// Modal elements
const dayModal = document.getElementById("day-detail-modal");
const dayModalClose = document.getElementById("day-modal-close");
const dayModalContent = document.getElementById("day-modal-content");

// Actual Pay modal elements
const actualPayModal = document.getElementById("actual-pay-modal");
const actualPayForm = document.getElementById("actual-pay-form");
const actualPayAmount = document.getElementById("actual-pay-amount");
const actualPayError = document.getElementById("actual-pay-error");

// Active calendar state
let currentYear = nowYear();
let currentMonth = nowMonth();
let currentMonthData = null;
let selectedIncomeDate = null;
let selectedIncomeAmount = null;

// ========================================
// Load a month's calendar from backend
// ========================================
export async function loadCalendar() {
  try {
    console.log(`📅 Loading calendar for ${currentYear}-${String(currentMonth).padStart(2, '0')}...`);
    const data = await apiGetMonthlyCalendar(currentYear, currentMonth);
    console.log("✅ Calendar data received:", data);
    renderCalendar(data);
  } catch (err) {
    console.error("❌ Calendar load error:", err);
    if (calendarGrid) {
      calendarGrid.innerHTML = `<div style="color: red; padding: 20px;">Error loading calendar: ${err.message}</div>`;
    }
  }
}

// ========================================
// Render the calendar grid
// ========================================
function renderCalendar(data) {
  const { year, month, days, summary } = data;
  currentMonthData = data;

  // Update header
  calendarMonthLabel.textContent = `${monthName(month)} ${year}`;

  // Update summary
  const net = (summary.income || 0) - (summary.expenses || 0);
  calIncomeLabel.textContent = formatMoney(summary.income || 0);
  calExpensesLabel.textContent = formatMoney(summary.expenses || 0);
  calNetLabel.textContent = formatMoney(net);

  // Clear grid
  calendarGrid.innerHTML = "";

  // Remove old weekday header if it exists
  const oldWeekdayHeader = calendarGrid.parentElement.querySelector(".calendar-weekdays");
  if (oldWeekdayHeader) {
    oldWeekdayHeader.remove();
  }

  // Create day headers (Sun-Sat)
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayHeader = document.createElement("div");
  weekdayHeader.className = "calendar-weekdays";
  dayNames.forEach((name) => {
    const header = document.createElement("div");
    header.className = "weekday";
    header.textContent = name.slice(0, 3);
    weekdayHeader.appendChild(header);
  });
  calendarGrid.parentElement.insertBefore(weekdayHeader, calendarGrid);

  // Create a map of days by dateKey for quick lookup
  const dayMap = {};
  days.forEach((day) => {
    dayMap[day.dateKey] = day;
  });

  // Get first day of month and how many days in month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "calendar-day calendar-day-empty";
    calendarGrid.appendChild(emptyDiv);
  }

  // Add all days of the month
  for (let d = 1; d <= lastDayOfMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const keyStr = dateObj.toISOString().split("T")[0];
    const day = dayMap[keyStr];

    const div = document.createElement("div");
    div.className = "calendar-day";

    if (day) {
      // Make clickable
      div.addEventListener("click", () => showDayDetails(day));

      // Day number and balance header
      const header = document.createElement("div");
      header.className = "calendar-day-header";
      header.textContent = String(day.day);
      div.appendChild(header);

      // Render events
      if (day.events && day.events.length > 0) {
        day.events.forEach((event) => {
          const ev = document.createElement("div");

          if (event.type === "income") {
            ev.className = "calendar-event-income";
            ev.textContent = formatMoney(event.amount);
          } else {
            ev.className = "calendar-event-expense";
            ev.textContent = `-${formatMoney(event.amount)}`;
          }

          div.appendChild(ev);
        });
      }

      // Add balance at bottom
      const balance = document.createElement("div");
      balance.className = "day-balance";
      balance.textContent = formatMoney(day.endBalance);
      div.appendChild(balance);
    } else {
      // Shouldn't happen, but fallback
      div.className = "calendar-day calendar-day-empty";
    }

    calendarGrid.appendChild(div);
  }

  // Add empty cells for remaining grid (to fill out 6 rows)
  const totalCells = calendarGrid.children.length;
  const remainingCells = (42 - totalCells); // 6 weeks * 7 days
  for (let i = 0; i < remainingCells; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "calendar-day calendar-day-empty";
    calendarGrid.appendChild(emptyDiv);
  }
}

// ========================================
// Show Day Detail Modal
// ========================================
function showDayDetails(day) {
  if (!dayModal || !dayModalContent) {
    console.error("Modal elements not found");
    return;
  }

  const date = new Date(day.date);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  let html = `<h3>${dateStr}</h3>`;
  html += `<div class="day-detail-section">`;
  html += `<p><strong>Starting Balance:</strong> ${formatMoney(day.startBalance || 0)}</p>`;

  if (day.events && day.events.length > 0) {
    html += `<div class="day-events">`;
    html += `<h4>Transactions:</h4>`;
    day.events.forEach((event, idx) => {
      const deleteId = event._id || event.recurringId || event.paycheckSettingsId;
      const deleteType = event._id ? 'transaction' : (event.recurringId ? 'recurring' : 'paycheck');
      if (event.type === "income") {
        const isActualIncome = !event.projected && event._id;
        const isPaycheck = event.projected && (event.name.toLowerCase().includes('paycheck') || event.recurringId || event.paycheckSettingsId);
        const clickableAttrs = (isActualIncome || isPaycheck) ? `data-income-id="${event._id || ''}" data-income-amount="${event.amount}" data-income-name="${event.name}" data-income-date="${day.dateKey}" data-is-actual="${!event.projected}" data-is-paycheck="${isPaycheck}" data-recurring-id="${event.recurringId || ''}" data-paycheck-id="${event.paycheckSettingsId || ''}"` : '';
        const style = `padding: 0.5rem; padding-left: 0.75rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin: 0.25rem 0; background: rgba(46, 204, 113, 0.15); border-left: 4px solid #2ecc71; color: #1e7e34; ${(isActualIncome || isPaycheck) ? 'cursor: pointer;' : ''}`;
        html += `<div style="${style}" class="income-clickable" ${clickableAttrs}>
          <span style="flex: 1; pointer-events: none;">✓ ${event.name}: <strong>+${formatMoney(event.amount)}</strong></span>
          <button style="background: none; color: #e74c3c; border: none; padding: 0; margin-left: 0.5rem; cursor: pointer; font-size: 0.85rem; white-space: nowrap; pointer-events: auto; font-weight: bold;" data-delete-id="${deleteId}" data-delete-type="${deleteType}">Delete</button>
        </div>`;
      } else {
        html += `<div class="detail-expense" style="padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin: 0.25rem 0;">
          <span style="flex: 1;">✗ ${event.name}: <strong>-${formatMoney(event.amount)}</strong></span>
          <button style="background: #e74c3c; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.85rem; white-space: nowrap; margin-left: 0.5rem;" data-delete-id="${deleteId}" data-delete-type="${deleteType}">Delete</button>
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
    const deleteButtons = dayModalContent.querySelectorAll("[data-delete-id]");
    deleteButtons.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const deleteId = btn.getAttribute("data-delete-id");
        const deleteType = btn.getAttribute("data-delete-type");
        if (deleteId && confirm("Are you sure you want to delete this?")) {
          try {
            if (deleteType === "transaction") {
              await apiDeleteTransaction(deleteId);
            } else if (deleteType === "recurring") {
              await apiDeleteRecurring(deleteId);
            } else if (deleteType === "paycheck") {
              await apiDeletePaycheck(deleteId);
            }
            dayModal.classList.remove("modal-visible");
            loadCalendar();
          } catch (err) {
            console.error("❌ Delete error:", err);
            alert("Failed to delete item");
          }
        }
      });
    });
    
    // Add click listeners for income items (actual income to edit, paychecks to record actual)
    const incomeItems = dayModalContent.querySelectorAll(".income-clickable");
    incomeItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.tagName === 'BUTTON') return; // Don't trigger if delete button clicked
        const incomeId = item.getAttribute("data-income-id");
        const incomeAmount = item.getAttribute("data-income-amount");
        const incomeName = item.getAttribute("data-income-name");
        const incomeDate = item.getAttribute("data-income-date");
        const isActual = item.getAttribute("data-is-actual") === 'true';
        const isPaycheck = item.getAttribute("data-is-paycheck") === 'true';
        
        selectedIncomeDate = incomeDate;
        selectedIncomeAmount = incomeAmount;
        
        const date = new Date(incomeDate);
        const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        
        // Store data for submission - including any existing actual income ID for this date
        actualPayModal.dataset.incomeDate = incomeDate;
        actualPayModal.dataset.incomeName = incomeName;
        actualPayModal.dataset.recurringId = item.getAttribute("data-recurring-id") || '';
        actualPayModal.dataset.paycheckId = item.getAttribute("data-paycheck-id") || '';
        actualPayModal.dataset.existingActualId = '';
        
        // Find any existing actual income for this date (to replace it)
        if (currentMonthData && currentMonthData.days) {
          const dayData = currentMonthData.days.find(d => d.dateKey === incomeDate);
          if (dayData && dayData.events) {
            const existingActual = dayData.events.find(e => e.type === 'income' && !e.projected && e._id);
            if (existingActual) {
              actualPayModal.dataset.existingActualId = existingActual._id;
            }
          }
        }
        
        actualPayAmount.value = incomeAmount;
        actualPayError.textContent = "";
        
        dayModal.classList.remove("modal-visible");
        actualPayModal.classList.add("modal-visible");
        
        // Focus input on mobile
        setTimeout(() => actualPayAmount.focus(), 100);
      });
    });
  }, 0);
}



// ========================================
// Helpers
// ========================================
function monthName(n) {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ][n - 1];
}

// ========================================
// Month switching
// ========================================
if (prevMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    loadCalendar();
  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    loadCalendar();
  });
}

// ========================================
// Handle Actual Pay Form Submission
// ========================================
if (actualPayForm) {
  actualPayForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    actualPayError.textContent = "";
    
    const amount = Number(actualPayAmount.value);
    const incomeName = actualPayModal.dataset.incomeName || "Paycheck";
    const incomeDate = actualPayModal.dataset.incomeDate;
    const recurringId = actualPayModal.dataset.recurringId;
    const paycheckId = actualPayModal.dataset.paycheckId;
    
    if (!amount || amount <= 0) {
      actualPayError.textContent = "Amount must be greater than 0";
      return;
    }
    
    try {
      const { apiCreateTransaction, apiDeleteRecurring, apiDeletePaycheck, apiDeleteTransaction } = await import("./api.js");
      
      // Delete the projected paycheck/recurring item first (only on first entry)
      if (recurringId) {
        await apiDeleteRecurring(recurringId);
        actualPayModal.dataset.recurringId = '';
      } else if (paycheckId) {
        await apiDeletePaycheck(paycheckId);
        actualPayModal.dataset.paycheckId = '';
      }
      
      // Delete any existing actual income for this date (to replace it)
      const existingActualId = actualPayModal.dataset.existingActualId;
      if (existingActualId) {
        await apiDeleteTransaction(existingActualId);
      }
      
      // Create new transaction for the actual income
      await apiCreateTransaction({
        description: incomeName,
        amount,
        category: "Income",
        date: incomeDate
      });
      
      // Close modal and reload calendar
      actualPayModal.classList.remove("modal-visible");
      actualPayForm.reset();
      dayModal.classList.remove("modal-visible");
      loadCalendar();
      
    } catch (err) {
      actualPayError.textContent = `Error: ${err.message}`;
      console.error("Failed to save actual pay:", err);
    }
  });
}

// ========================================
// Modal controls
// ========================================
if (dayModalClose) {
  dayModalClose.addEventListener("click", () => {
    if (dayModal) {
      dayModal.classList.remove("modal-visible");
    }
  });
}

if (dayModal) {
  dayModal.addEventListener("click", (e) => {
    if (e.target === dayModal) {
      dayModal.classList.remove("modal-visible");
    }
  });
}

if (actualPayModal) {
  actualPayModal.addEventListener("click", (e) => {
    if (e.target === actualPayModal) {
      actualPayModal.classList.remove("modal-visible");
    }
  });
}