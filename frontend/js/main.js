// frontend/js/main.js
// ========================================
// Underground Water 2 - App Entry Point
// Runs on startup and ties all modules together
// ========================================

// Import ALL modules to ensure they're loaded
import "./config.js";
import "./api.js";
import "./ui.js";
import "./dashboard.js";
import "./calendar.js";
import "./recurring.js";
import "./settings.js";
import { checkAuthOnLoad } from "./auth.js";

// ========================================
// APP INIT
// ========================================
console.log("🚀 Underground Water 2 - Starting...");

window.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM Content Loaded");
  // 1. Check token + load login or app shell
  checkAuthOnLoad();

  // 2. Default active view after auth is "dashboard-view"
  // (the auth.js module calls showView() after successful login)
});

// Also check on immediate load (in case DOM already loaded)
if (document.readyState === "loading") {
  console.log("⏳ DOM still loading, waiting for DOMContentLoaded...");
} else {
  console.log("✅ DOM already loaded, checking auth...");
  checkAuthOnLoad();
}