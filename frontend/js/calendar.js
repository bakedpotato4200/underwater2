// frontend/js/calendar.js
// ========================================
// Underground Water 2 - Calendar Page Logic
// Loads monthly calendar + renders grid + summary
// ========================================

import {
  apiGetMonthlyCalendar
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

// Income modal elements
const addIncomeModal = document.getElementById("add-income-modal");
const addIncomeModalClose = document.getElementById("add-income-modal-close");
const addIncomeForm = document.getElementById("add-income-form");
const addIncomeDate = document.getElementById("add-income-date");
const addIncomeAmount = document.getElementById("add-income-amount");
const addIncomeDescription = document.getElementById("add-income-description");
const addIncomeCategory = document.getElementById("add-income-category");
const addIncomeError = document.getElementById("add-income-error");

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
  
  // Make income items clickable to record actual income
  const incomeItems = dayModalContent.querySelectorAll(".detail-income");
  incomeItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.style.background = "#f0f0f0";
    });
    item.addEventListener("mouseleave", () => {
      item.style.background = "transparent";
    });
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const incomeAmount = parseFloat(item.dataset.incomeAmount);
      const incomeName = item.dataset.incomeName;
      dayModal.classList.remove("modal-visible");
      openAddIncomeModal(day.dateKey, day.date, incomeAmount, incomeName);
    });
  });
}

// ========================================
// Open Add Income Modal
// ========================================
function openAddIncomeModal(dateKey, dateObj, projectedAmount, incomeName = null) {
  selectedIncomeDate = dateKey;
  selectedIncomeAmount = projectedAmount;
  
  const date = new Date(dateObj);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  
  addIncomeDate.textContent = `${dateStr} (Projected: ${formatMoney(projectedAmount)})`;
  addIncomeAmount.value = projectedAmount;
  addIncomeDescription.value = incomeName || "Actual Paycheck";
  addIncomeError.textContent = "";
  
  addIncomeModal.classList.add("modal-visible");
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
// Handle Add Income Form Submission
// ========================================
if (addIncomeForm) {
  addIncomeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addIncomeError.textContent = "";
    
    const amount = Number(addIncomeAmount.value);
    const description = addIncomeDescription.value.trim();
    const category = addIncomeCategory.value.trim();
    
    if (!amount || amount <= 0) {
      addIncomeError.textContent = "Amount must be greater than 0";
      return;
    }
    
    if (!description) {
      addIncomeError.textContent = "Description is required";
      return;
    }
    
    try {
      const { apiCreateTransaction } = await import("./api.js");
      
      // Create transaction for this specific date
      await apiCreateTransaction({
        description,
        amount,
        category,
        date: selectedIncomeDate
      });
      
      // Close modal and reload calendar
      addIncomeModal.classList.remove("modal-visible");
      addIncomeForm.reset();
      loadCalendar();
      
    } catch (err) {
      addIncomeError.textContent = `Error: ${err.message}`;
      console.error("Failed to save income:", err);
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

if (addIncomeModalClose) {
  addIncomeModalClose.addEventListener("click", () => {
    if (addIncomeModal) {
      addIncomeModal.classList.remove("modal-visible");
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

if (addIncomeModal) {
  addIncomeModal.addEventListener("click", (e) => {
    if (e.target === addIncomeModal) {
      addIncomeModal.classList.remove("modal-visible");
    }
  });
}