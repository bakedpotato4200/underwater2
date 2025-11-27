// frontend/js/config.js
// ========================================
// Underground Water 2 - Frontend Config
// Centralized configuration for API calls
// ========================================

// IMPORTANT:
// If running locally on Replit or Railway, set your backend URL here:

export const API_BASE_URL = "http://localhost:3000/api"; 
// Example for production:
// export const API_BASE_URL = "https://your-backend-url.up.railway.app/api";

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
// Auto attaches token + handles JSON
// --------------------------------------------
export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // Parse JSON safely
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { error: "Invalid JSON response" };
  }

  if (!response.ok) {
    const msg = data.error || "API error";
    throw new Error(msg);
  }

  return data;
}

// --------------------------------------------
// Date Helpers
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