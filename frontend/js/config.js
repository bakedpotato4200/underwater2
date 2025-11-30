// ================================================
// PRODUCTION API BASE URL
// Uses environment variable if available, fallback to Railway
// ================================================
const getApiBaseUrl = () => {
  // Check if in Vercel environment with env var
  if (typeof process !== 'undefined' && process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  // Check window global (set by HTML if available)
  if (window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  // Default fallback to Railway backend
  return "https://underwater2-production.up.railway.app";
};

export const API_BASE_URL = getApiBaseUrl();

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