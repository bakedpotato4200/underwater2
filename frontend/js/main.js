// frontend/js/main.js
// Under Water 2 – Main Loader (Version 2 Restore)

import { initTheme } from "./theme.js";
import { checkAuthOnLoad } from "./auth.js";

// Start the UI once page loads
window.addEventListener("DOMContentLoaded", () => {
    console.log("UW2: App starting…");
    initApp();
});

async function initApp() {
    try {
        await loadModules();
        console.log("UW2: All modules loaded");
        initTheme();
        checkAuthOnLoad();
    } catch (e) {
        console.error("UW2 Startup Error:", e);
    }
}

async function loadModules() {
    await import("./config.js");
    await import("./api.js");
    await import("./ui.js");
    await import("./dashboard.js");
    await import("./calendar.js");
    await import("./recurring.js");
    await import("./settings.js");
    await import("./inactivity.js");
    await import("./theme.js");
    await import("./auth.js");
}