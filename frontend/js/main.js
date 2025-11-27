// frontend/js/main.js
// ========================================
// Underground Water 2 - App Entry Point
// Runs on startup and ties all modules together
// ========================================

import { checkAuthOnLoad } from "./auth.js";
import { showView } from "./ui.js";

// ========================================
// APP INIT
// ========================================
window.addEventListener("DOMContentLoaded", () => {
  // 1. Check token + load login or app shell
  checkAuthOnLoad();

  // 2. Default active view after auth is "dashboard-view"
  // (the auth.js module calls showView() after successful login)
});