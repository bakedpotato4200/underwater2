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

// Active calendar state
let currentYear = nowYear();
let currentMonth = nowMonth();

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

  // Update header
  calendarMonthLabel.textContent = `${monthName(month)} ${year}`;

  // Update summary
  const net = (summary.income || 0) - (summary.expenses || 0);
  calIncomeLabel.textContent = formatMoney(summary.income || 0);
  calExpensesLabel.textContent = formatMoney(summary.expenses || 0);
  calNetLabel.textContent = formatMoney(net);

  // Clear grid
  calendarGrid.innerHTML = "";

  // Render each day
  days.forEach((day) => {
    const div = document.createElement("div");
    div.className = "calendar-day";

    // Day number
    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day.day;
    div.appendChild(header);

    // Render events
    day.events.forEach((event) => {
      const ev = document.createElement("div");

      if (event.type === "income") {
        ev.className = "calendar-event-income";
        ev.textContent = `+${formatMoney(event.amount)}`;
      } else {
        ev.className = "calendar-event-expense";
        ev.textContent = `-${formatMoney(event.amount)}`;
      }

      div.appendChild(ev);
    });

    calendarGrid.appendChild(div);
  });
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
prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  loadCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  loadCalendar();
});