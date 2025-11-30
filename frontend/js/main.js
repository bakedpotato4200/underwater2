// frontend/js/main.js
// ==================================================
// Under Water 2 – Main Loader + Debug System
// ==================================================

// EARLY DEBUG – confirm JS running
try {
  document.getElementById("early-debug").innerText = "JS OK";
} catch (e) {}

const debugConsole = document.getElementById("debug-console");
function log(msg) {
  console.log(msg);
  if (debugConsole) debugConsole.innerHTML += msg + "\n";
}

// ==================================================
// MODULE DEBUGGING STAGE
// ==================================================
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

// ==================================================
// Sequential module loading
// ==================================================
await loadModule("config");
await loadModule("api");
await loadModule("ui");
await loadModule("dashboard");
await loadModule("calendar");
await loadModule("recurring");
await loadModule("settings");
await loadModule("inactivity");
await loadModule("theme");
await loadModule("auth");

log("🎉 All modules loaded");

// ==================================================
// NORMAL APP STARTUP
// ==================================================
import { initTheme } from "./theme.js";
import { checkAuthOnLoad } from "./auth.js";

initTheme();
checkAuthOnLoad();