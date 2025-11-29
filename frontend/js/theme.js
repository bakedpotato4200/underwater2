// frontend/js/theme.js
// ========================================
// Under Water 2 - Theme Management
// Handles light/dark mode switching
// ========================================

// Theme constants
const THEME_KEY = "uwaterTheme";
const DARK_MODE = "dark";
const LIGHT_MODE = "light";

// Initialize theme on page load
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || DARK_MODE;
  applyTheme(savedTheme);
  
  // Update switch
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    // Set checked state based on saved theme (light mode = checked)
    themeSwitch.checked = savedTheme === LIGHT_MODE;
    
    // Listen for switch changes
    themeSwitch.addEventListener("change", (e) => {
      const newTheme = e.target.checked ? LIGHT_MODE : DARK_MODE;
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }
}

// Apply theme to document
function applyTheme(theme) {
  const html = document.documentElement;
  
  if (theme === LIGHT_MODE) {
    html.setAttribute("data-theme", LIGHT_MODE);
  } else {
    html.removeAttribute("data-theme");
  }
}

export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || DARK_MODE;
}
