// frontend/js/api.js
// ========================================
// Underground Water 2 - API Wrapper
// All API calls go through this module
// ========================================

import { apiRequest } from "./config.js";

// -----------------------
// AUTH
// -----------------------
export function apiSignup(email, password) {
  return apiRequest("/auth/signup", "POST", { email, password });
}

export function apiLogin(email, password) {
  return apiRequest("/auth/login", "POST", { email, password });
}

export function apiVerify() {
  return apiRequest("/auth/verify", "GET");
}

export function apiForgotPassword(email) {
  return apiRequest("/auth/forgot-password", "POST", { email });
}

export function apiResetPassword(email, resetCode, newPassword) {
  return apiRequest("/auth/reset-password", "POST", { email, resetCode, newPassword });
}

// -----------------------
// STARTING BALANCE
// -----------------------
export function apiGetStartingBalance() {
  return apiRequest("/starting-balance", "GET");
}

export function apiSetStartingBalance(startingBalance) {
  return apiRequest("/starting-balance", "POST", { startingBalance });
}

// -----------------------
// PAYCHECK SETTINGS
// -----------------------
export function apiGetPaycheckSettings() {
  return apiRequest("/paycheck-settings", "GET");
}

export function apiSetPaycheckSettings(payAmount, frequency, startDate) {
  return apiRequest("/paycheck-settings", "POST", {
    payAmount,
    frequency,
    startDate,
  });
}

// -----------------------
// RECURRING ITEMS
// -----------------------
export function apiGetRecurring() {
  return apiRequest("/recurring", "GET");
}

export function apiCreateRecurring(item) {
  return apiRequest("/recurring", "POST", item);
}

export function apiUpdateRecurring(id, item) {
  return apiRequest(`/recurring/${id}`, "PUT", item);
}

export function apiDeleteRecurring(id) {
  return apiRequest(`/recurring/${id}`, "DELETE");
}

// -----------------------
// CALENDAR
// -----------------------
export function apiGetMonthlyCalendar(year, month) {
  return apiRequest(`/calendar/month?year=${year}&month=${month}`, "GET");
}

export function apiGetYearForecast(year) {
  return apiRequest(`/calendar/year?year=${year}`, "GET");
}

// -----------------------
// TRANSACTIONS
// -----------------------
export function apiGetTransactions() {
  return apiRequest("/transactions", "GET");
}

export function apiCreateTransaction(tx) {
  return apiRequest("/transactions", "POST", tx);
}

export function apiDeleteTransaction(id) {
  return apiRequest(`/transactions/${id}`, "DELETE");
}

// -----------------------
// CATEGORIES
// -----------------------
export function apiGetCategories() {
  return apiRequest("/categories", "GET");
}

export function apiCreateCategory(cat) {
  return apiRequest("/categories", "POST", cat);
}

export function apiDeleteCategory(id) {
  return apiRequest(`/categories/${id}`, "DELETE");
}

// -----------------------
// BILLS (if needed)
// -----------------------
export function apiGetBills() {
  return apiRequest("/bills", "GET");
}

export function apiCreateBill(bill) {
  return apiRequest("/bills", "POST", bill);
}

export function apiUpdateBill(id, bill) {
  return apiRequest(`/bills/${id}`, "PUT", bill);
}

export function apiDeleteBill(id) {
  return apiRequest(`/bills/${id}`, "DELETE");
}