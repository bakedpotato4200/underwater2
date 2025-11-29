// frontend/js/ui.js
// ========================================
// Under Water 2 - UI Controls
// Handles sidebar navigation and view switching
// ========================================

import { loadDashboard } from "./dashboard.js";
import { loadCalendar } from "./calendar.js";
import { loadRecurringPage } from "./recurring.js";
import { loadSettingsPage } from "./settings.js";

// All views
const views = document.querySelectorAll(".view");

// Sidebar navigation
const navButtons = document.querySelectorAll(".nav-item");

// Current active view
let activeView = "dashboard-view";

// Get saved view from session storage
export function getSavedView() {
  return sessionStorage.getItem("activeView") || "dashboard-view";
}

// ----------------------------------------------
// Switch to a specific view by ID
// ----------------------------------------------
export function showView(viewId) {
  activeView = viewId;
  
  // Save current view to sessionStorage
  sessionStorage.setItem("activeView", viewId);

  // Hide all views
  views.forEach((v) => v.classList.remove("view-active"));

  // Show selected view
  const selected = document.getElementById(viewId);
  if (selected) selected.classList.add("view-active");

  // Update sidebar highlight
  navButtons.forEach((btn) => {
    if (btn.dataset.view === viewId) {
      btn.classList.add("nav-item-active");
    } else {
      btn.classList.remove("nav-item-active");
    }
  });

  // Load content for each page
  if (viewId === "dashboard-view") loadDashboard();
  if (viewId === "calendar-view") loadCalendar();
  if (viewId === "recurring-view") loadRecurringPage();
  if (viewId === "settings-view") loadSettingsPage();
}

// ----------------------------------------------
// Attach sidebar button events
// ----------------------------------------------
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    showView(view);
    closeSidebar();
  });
});

// ================================================
// SIDEBAR TOGGLE
// ================================================
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const menuToggleBtn = document.getElementById("menu-toggle-btn");

function openSidebar() {
  if (sidebar) sidebar.classList.add("active");
  if (sidebarOverlay) sidebarOverlay.classList.add("active");
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("active");
  if (sidebarOverlay) sidebarOverlay.classList.remove("active");
}

if (menuToggleBtn) {
  menuToggleBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("active")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", closeSidebar);
}