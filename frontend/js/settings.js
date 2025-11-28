// frontend/js/settings.js
// ========================================
// Underground Water 2 - Settings Page
// Handles Starting Balance + Paycheck Settings
// ========================================

import {
  apiGetStartingBalance,
  apiSetStartingBalance,
  apiGetPaycheckSettings,
  apiSetPaycheckSettings
} from "./api.js";

import { formatMoney } from "./config.js";

// DOM elements
const startBalInput = document.getElementById("starting-balance-input");
const startBalForm = document.getElementById("starting-balance-form");
const startBalStatus = document.getElementById("starting-balance-status");

const payForm = document.getElementById("paycheck-form");
const payAmountInput = document.getElementById("pay-amount-input");
const payFrequencyInput = document.getElementById("pay-frequency-input");
const payStartDateInput = document.getElementById("pay-start-date-input");
const payStatus = document.getElementById("paycheck-status");

// ========================================
// Load both settings when the page is shown
// Called by: ui.js → showView("settings-view")
// ========================================
export async function loadSettingsPage() {
  loadStartingBalance();
  loadPaycheckSettings();
}

// ========================================
// Starting Balance: GET
// ========================================
async function loadStartingBalance() {
  startBalStatus.textContent = "";

  try {
    const data = await apiGetStartingBalance();
    if (data && typeof data.startingBalance === "number") {
      startBalInput.value = data.startingBalance;
    }
  } catch (err) {
    startBalStatus.textContent = "Could not load starting balance.";
  }
}

// ========================================
// Starting Balance: SAVE
// ========================================
startBalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  startBalStatus.textContent = "";
  startBalStatus.className = "form-status";

  const value = Number(startBalInput.value);

  try {
    await apiSetStartingBalance(value);
    startBalStatus.textContent = "✓ Saved successfully!";
    startBalStatus.className = "form-status success";
    setTimeout(() => {
      startBalStatus.textContent = "";
    }, 3000);
  } catch (err) {
    startBalStatus.textContent = "✗ " + err.message;
    startBalStatus.className = "form-status";
  }
});

// ========================================
// Paycheck Settings: GET
// ========================================
async function loadPaycheckSettings() {
  payStatus.textContent = "";

  try {
    const data = await apiGetPaycheckSettings();

    if (data) {
      if (data.payAmount) payAmountInput.value = data.payAmount;
      if (data.frequency) payFrequencyInput.value = data.frequency;
      if (data.startDate) {
        payStartDateInput.value = data.startDate.split("T")[0];
      }
    }
  } catch (err) {
    payStatus.textContent = "Could not load paycheck settings.";
  }
}

// ========================================
// Paycheck Settings: SAVE
// ========================================
payForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  payStatus.textContent = "";
  payStatus.className = "form-status";

  const amt = Number(payAmountInput.value);
  const freq = payFrequencyInput.value;
  const date = payStartDateInput.value;

  try {
    await apiSetPaycheckSettings(amt, freq, date);
    payStatus.textContent = "✓ Saved successfully!";
    payStatus.className = "form-status success";
    setTimeout(() => {
      payStatus.textContent = "";
    }, 3000);
  } catch (err) {
    payStatus.textContent = "✗ " + err.message;
    payStatus.className = "form-status";
  }
});