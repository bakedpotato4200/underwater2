// EARLY DEBUG — confirm JS is alive
try {
  document.getElementById("early-debug").innerText = "JS Loaded";
} catch (e) { }

// ================================================
// MODULE DEBUGGING STAGE
// ================================================

console.log("🟦 main.js: starting module import test");

// Helper function for clean module loading
async function loadModule(name) {
  try {
    console.log(`Loading ${name}…`);
    await import(`./${name}.js`);
    console.log(`✔️  ${name}.js loaded`);
  } catch (e) {
    console.error(`❌ ${name}.js failed:`, e);
  }
}

// Load modules one by one with debug output
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

console.log("🎉 All modules loaded");

// ================================================
// NORMAL APP STARTUP
// ================================================

import { initTheme } from "./theme.js";
import { checkAuthOnLoad } from "./auth.js";

initTheme();
checkAuthOnLoad();