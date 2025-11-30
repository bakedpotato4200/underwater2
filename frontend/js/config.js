// Under Water 2 - Configuration & API Setup
// Production-ready API base URL and token management

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  if (window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  return "https://underwater2-production.up.railway.app";
};

export const API_BASE_URL = getApiBaseUrl();

// Token storage helpers
export function getToken() {
  return sessionStorage.getItem("uw2_token");
}

export function setToken(token) {
  sessionStorage.setItem("uw2_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("uw2_token");
}

// Generic API wrapper for all HTTP requests
export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json().catch(() => ({
      error: "Invalid JSON returned",
    }));

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}
