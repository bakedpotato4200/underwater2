// EARLY DEBUG — ENSURE JS IS RUNNING
try {
  document.getElementById("early-debug").innerText = "main.js started";
} catch (e) {
  // If THIS fails, JS is breaking before DOM
}

// ===========================================================
//  Under Water 2 — App Entry Point
// ===========================================================

// Import modules
import "./config.js";
import "./api.js";
import "./ui.js";
import "./dashboard.js";
import "./calendar.js";
import "./recurring.js";
import "./settings.js";
import "./inactivity.js";
import { initTheme } from "./theme.js";
import { checkAuthOnLoad } from "./auth.js";

// Start log
console.log("🚀 Under Water 2 — main.js running");

// Init theme first
initTheme();

// DOM READY
window.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOMContentLoaded fired");
  checkAuthOnLoad();
});

// If DOM already loaded
if (document.readyState !== "loading") {
  console.log("✅ DOM already loaded, checking auth");
  checkAuthOnLoad();
}