// frontend/js/settings.js
// ========================================
// Under Water 2 - Settings Page
// Handles Account, Password, Starting Balance + Paycheck Settings
// ========================================

import {
  apiGetStartingBalance,
  apiSetStartingBalance,
  apiGetPaycheckSettings,
  apiSetPaycheckSettings,
  apiGetProfile,
  apiUpdateProfile,
  apiChangePassword
} from "./api.js";

import { formatMoney } from "./config.js";

// Profile DOM elements
const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name-input");
const profileStatus = document.getElementById("profile-status");

// Change password DOM elements
const changePasswordForm = document.getElementById("change-password-form");
const currentPasswordInput = document.getElementById("current-password-input");
const newPasswordInput = document.getElementById("new-password-input");
const verifyPasswordInput = document.getElementById("verify-password-input");
const changePasswordStatus = document.getElementById("change-password-status");

// Starting balance DOM elements
const startBalInput = document.getElementById("starting-balance-input");
const startBalForm = document.getElementById("starting-balance-form");
const startBalStatus = document.getElementById("starting-balance-status");

// Paycheck DOM elements
const payForm = document.getElementById("paycheck-form");
const payAmountInput = document.getElementById("pay-amount-input");
const payFrequencyInput = document.getElementById("pay-frequency-input");
const payStartDateInput = document.getElementById("pay-start-date-input");
const payStatus = document.getElementById("paycheck-status");

// ========================================
// Load all settings when the page is shown
// Called by: ui.js → showView("settings-view")
// ========================================
export async function loadSettingsPage() {
  loadProfile();
  loadStartingBalance();
  loadPaycheckSettings();
}

// ========================================
// Profile: GET
// ========================================
async function loadProfile() {
  profileStatus.textContent = "";

  try {
    const data = await apiGetProfile();
    if (data && data.user) {
      profileNameInput.value = data.user.name || "";
    }
  } catch (err) {
    profileStatus.textContent = "Could not load profile.";
  }
}

// ========================================
// Profile: SAVE NAME
// ========================================
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  profileStatus.textContent = "";
  profileStatus.className = "form-status";

  const name = profileNameInput.value.trim();

  if (!name) {
    profileStatus.textContent = "✗ Name cannot be empty";
    profileStatus.className = "form-status";
    return;
  }

  try {
    await apiUpdateProfile(name);
    profileStatus.textContent = "✓ Name saved successfully!";
    profileStatus.className = "form-status success";
    setTimeout(() => {
      profileStatus.textContent = "";
    }, 3000);
  } catch (err) {
    profileStatus.textContent = "✗ " + err.message;
    profileStatus.className = "form-status";
  }
});

// ========================================
// Change Password
// ========================================
changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  changePasswordStatus.textContent = "";
  changePasswordStatus.className = "form-status";

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const verifyPassword = verifyPasswordInput.value.trim();

  if (!currentPassword) {
    changePasswordStatus.textContent = "✗ Current password is required";
    changePasswordStatus.className = "form-status";
    return;
  }
  if (!newPassword) {
    changePasswordStatus.textContent = "✗ New password is required";
    changePasswordStatus.className = "form-status";
    return;
  }
  if (!verifyPassword) {
    changePasswordStatus.textContent = "✗ Password verification is required";
    changePasswordStatus.className = "form-status";
    return;
  }
  if (newPassword.length < 6) {
    changePasswordStatus.textContent = "✗ New password must be at least 6 characters";
    changePasswordStatus.className = "form-status";
    return;
  }
  if (newPassword !== verifyPassword) {
    changePasswordStatus.textContent = "✗ New passwords do not match";
    changePasswordStatus.className = "form-status";
    return;
  }
  if (currentPassword === newPassword) {
    changePasswordStatus.textContent = "✗ New password cannot be the same as current password";
    changePasswordStatus.className = "form-status";
    return;
  }

  try {
    await apiChangePassword(currentPassword, newPassword);
    changePasswordStatus.textContent = "✓ Password changed successfully!";
    changePasswordStatus.className = "form-status success";
    changePasswordForm.reset();
    setTimeout(() => {
      changePasswordStatus.textContent = "";
    }, 3000);
  } catch (err) {
    changePasswordStatus.textContent = "✗ " + err.message;
    changePasswordStatus.className = "form-status";
  }
});

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