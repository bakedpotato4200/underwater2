// EARLY DEBUG — confirm JS is alive
try {
  document.getElementById("early-debug").innerText = "main.js started";
} catch (e) {}

// ===============================================
//  MODULE DEBUGGING STAGE
// ===============================================

console.log("🟦 main.js: starting module import test");

// Test each module one by one
try {
  console.log("Loading config.js…");
  await import("./config.js");
  console.log("✔ config.js loaded");
} catch (e) {
  console.error("❌ config.js failed:", e);
  document.getElementById("early-debug").innerText = "config.js CRASHED";
}

try {
  console.log("Loading api.js…");
  await import("./api.js");
  console.log("✔ api.js loaded");
} catch (e) {
  console.error("❌ api.js failed:", e);
  document.getElementById("early-debug").innerText = "api.js CRASHED";
}

try {
  console.log("Loading ui.js…");
  await import("./ui.js");
  console.log("✔ ui.js loaded");
} catch (e) {
  console.error("❌ ui.js failed:", e);
  document.getElementById("early-debug").innerText = "ui.js CRASHED";
}

try {
  console.log("Loading dashboard.js…");
  await import("./dashboard.js");
  console.log("✔ dashboard.js loaded");
} catch (e) {
  console.error("❌ dashboard.js failed:", e);
  document.getElementById("early-debug").innerText = "dashboard.js CRASHED";
}

try {
  console.log("Loading calendar.js…");
  await import("./calendar.js");
  console.log("✔ calendar.js loaded");
} catch (e) {
  console.error("❌ calendar.js failed:", e);
  document.getElementById("early-debug").innerText = "calendar.js CRASHED";
}

try {
  console.log("Loading recurring.js…");
  await import("./recurring.js");
  console.log("✔ recurring.js loaded");
} catch (e) {
  console.error("❌ recurring.js failed:", e);
  document.getElementById("early-debug").innerText = "recurring.js CRASHED";
}

try {
  console.log("Loading settings.js…");
  await import("./settings.js");
  console.log("✔ settings.js loaded");
} catch (e) {
  console.error("❌ settings.js failed:", e);
  document.getElementById("early-debug").innerText = "settings.js CRASHED";
}

try {
  console.log("Loading inactivity.js…");
  await import("./inactivity.js");
  console.log("✔ inactivity.js loaded");
} catch (e) {
  console.error("❌ inactivity.js failed:", e);
  document.getElementById("early-debug").innerText = "inactivity.js CRASHED";
}

try {
  console.log("Loading theme.js…");
  const { initTheme } = await import("./theme.js");
  initTheme();
  console.log("✔ theme.js loaded");
} catch (e) {
  console.error("❌ theme.js failed:", e);
  document.getElementById("early-debug").innerText = "theme.js CRASHED";
}

try {
  console.log("Loading auth.js…");
  const { checkAuthOnLoad } = await import("./auth.js");
  checkAuthOnLoad();
  console.log("✔ auth.js loaded");
} catch (e) {
  console.error("❌ auth.js failed:", e);
  document.getElementById("early-debug").innerText = "auth.js CRASHED";
}

document.getElementById("early-debug").innerText = "ALL MODULES LOADED ✔";
console.log("🎉 All modules loaded");