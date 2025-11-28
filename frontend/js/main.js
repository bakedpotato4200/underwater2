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

// ========================================
// SIDEBAR TOGGLE FUNCTIONALITY
// ========================================
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const navItems = document.querySelectorAll('.nav-item');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', openSidebar);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  navItems.forEach(item => {
    item.addEventListener('click', closeSidebar);
  });
}

// Initialize sidebar toggle when app is ready
window.addEventListener('DOMContentLoaded', initSidebarToggle);
if (document.readyState !== 'loading') {
  initSidebarToggle();
}