// ================================================
// PRODUCTION API BASE URL
// index.html injects: window.__API_BASE_URL__
// Fallback: Railway backend URL (domain only)
// ================================================
export const API_BASE_URL =
  window.__API_BASE_URL__ || "https://underwater2-production.up.railway.app";

// --------------------------------------------
// Token Helpers
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
// Generic API Wrapper
// endpoint should always start with "/api/..."
// --------------------------------------------
export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🔗 API Call: ${url}`);

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
      console.error(`API Error [${response.status}]:`, data);
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`❌ API Request Failed (${method} ${endpoint})`, err.message);
    throw err;
  }
}