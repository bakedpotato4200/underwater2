// frontend/js/config.js
// ========================================
// Under Water 2 - Frontend Config
// ========================================
//
// 🚨 IMPORTANT FOR LATER 🚨
// This configuration is for LOCAL DEVELOPMENT ONLY.
// It tells the frontend to use the backend running on your PC.
//
// When you switch to using Railway or production:
//   CHANGE API_BASE_URL to your Railway URL.
// ========================================

// API Base URL - configurable for different environments
// Local development: "/api" (proxied through backend)
// Vercel + Railway: set via window.__API_BASE_URL__ variable injected in HTML
export const API_BASE_URL = window.__API_BASE_URL__ || "/api";

// --------------------------------------------
// Token Helpers
// Note: Using sessionStorage instead of localStorage
// so users must log in every browser session
// (token is cleared when browser/tab closes)
// --------------------------------------------
export function getToken() {
  return sessionStorage.getItem("uw2_token");
}

export function setToken(token) {
  sessionStorage.setItem("uw2_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("uw2_token");
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

  try {
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
      console.error(`API Error [${response.status}]:`, data);
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Request Failed (${method} ${endpoint}):`, err.message);
    throw err;
  }
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