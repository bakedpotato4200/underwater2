// ================================================
//  PRODUCTION API BASE URL
// ================================================
// MUST end with /api or the entire app breaks
export const API_BASE_URL =
  window.__API_BASE_URL__ || "https://underwater2-production.up.railway.app/api";

// --------------------------------------------
// Token Helpers (using sessionStorage)
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
// --------------------------------------------
export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log(`🔗 API Call: ${API_BASE_URL}${endpoint}`);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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