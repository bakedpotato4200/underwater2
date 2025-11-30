// frontend/js/main.js
// ========================================
// Under Water 2 - Main Loader + Debug System
// ========================================

// EARLY DEBUG — confirm JS running
try {
  document.getElementById("early-debug").innerText = "JS Loaded";
} catch (e) {}

const debugConsole = document.getElementById("debug-console");
function log(msg) {
  console.log(msg);
  if (debugConsole) debugConsole.innerHTML += msg + "\n";
}

// ----------------------------------------
// MODULE DEBUGGING STAGE
// ----------------------------------------
log("🟦 main.js: starting module import test");

// Helper to load modules cleanly
async function loadModule(name) {
  try {
    log(`Loading ${name}.js…`);
    await import(`./${name}.js`);
    log(`✔️ ${name}.js loaded`);
  } catch (e) {
    log(`❌ ${name}.js failed: ${e.message || e}`);
  }
}

// ----------------------------------------
// Sequential module loading
// ----------------------------------------
await loadModule("js/config");
await loadModule("js/api");
await loadModule("js/ui");
await loadModule("js/dashboard");
await loadModule("js/calendar");
await loadModule("js/recurring");
await loadModule("js/settings");
await loadModule("js/inactivity");
await loadModule("js/theme");
await loadModule("js/auth");

log("🎉 All modules loaded");

// ----------------------------------------
// NORMAL APP STARTUP
// ----------------------------------------
import { initTheme } from "./js/theme.js";
import { checkAuthOnLoad } from "./js/auth.js";

initTheme();
checkAuthOnLoad();