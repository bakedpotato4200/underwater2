// frontend/js/config.js
// ========================================
// Underground Water 2 - Frontend Config
// ========================================
//
// 🚨 IMPORTANT FOR LATER 🚨
// This configuration is for LOCAL DEVELOPMENT ONLY.
// It tells the frontend to use the backend running on your PC.
//
// When you switch to using Railway or production:
//   CHANGE API_BASE_URL to your Railway URL.
// ========================================

// Detect if running on Replit and use appropriate backend URL
const isReplit = window.location.hostname.includes('replit.dev');
export const API_BASE_URL = isReplit 
  ? `${window.location.protocol}//${window.location.hostname}:3000/api`
  : "http://localhost:3000/api";

// --------------------------------------------
// Token Helpers
// --------------------------------------------
export function getToken() {
  return localStorage.getItem("uw2_token");
}

export function setToken(token) {
  localStorage.setItem("uw2_token", token);
}

export function clearToken() {
  localStorage.removeItem("uw2_token");
}

// --------------------------------------------
// API Call Wrapper
// --------------------------------------------
export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { error: "Invalid JSON response" };
  }

  if (!response.ok) {
    throw new Error(data.error || "API error");
  }

  return data;
}

// --------------------------------------------
// Date + Money Helpers
// --------------------------------------------
export function formatMoney(amount) {
  return "$" + Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function nowYear() {
  return new Date().getFullYear();
}

export function nowMonth() {
  return new Date().getMonth() + 1;
}

export function dateKey(date) {
  return date.toISOString().split("T")[0];
}