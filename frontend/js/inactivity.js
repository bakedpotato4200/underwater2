// frontend/js/inactivity.js
// ========================================
// Underground Water 2 - Inactivity Logout
// Auto-logout after 15 minutes of no activity
// ========================================

import { clearToken } from "./config.js";
import { showAuth } from "./auth.js";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
let inactivityTimer = null;
let isTrackingActive = false;

// ========================================
// Reset inactivity timer
// Called on any user activity
// ========================================
function resetInactivityTimer() {
  // Clear existing timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Set new timer
  inactivityTimer = setTimeout(() => {
    console.warn("⏱️ User inactive for 15 minutes. Logging out...");
    logoutDueToInactivity();
  }, INACTIVITY_TIMEOUT);
}

// ========================================
// Logout due to inactivity
// ========================================
function logoutDueToInactivity() {
  clearToken();
  showAuth();
  alert("You've been logged out due to inactivity. Please log in again.");
}

// ========================================
// Initialize inactivity tracking
// Called when user logs in
// ========================================
export function initInactivityTracking() {
  if (isTrackingActive) return; // Already tracking, don't start again
  
  isTrackingActive = true;
  console.log("✅ Inactivity tracking enabled (15 minute timeout)");

  // Track various user activities
  const events = ["mousedown", "keypress", "scroll", "touchstart", "click"];

  events.forEach((event) => {
    document.addEventListener(event, resetInactivityTimer, true);
  });

  // Start the initial timer
  resetInactivityTimer();
}

// ========================================
// Stop inactivity tracking (on logout)
// ========================================
export function stopInactivityTracking() {
  if (!isTrackingActive) return; // Not tracking, nothing to stop
  
  isTrackingActive = false;
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  const events = ["mousedown", "keypress", "scroll", "touchstart", "click"];
  events.forEach((event) => {
    document.removeEventListener(event, resetInactivityTimer, true);
  });

  console.log("❌ Inactivity tracking disabled");
}
