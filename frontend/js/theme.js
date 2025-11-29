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
  
  // Update radio buttons
  const radios = document.querySelectorAll('input[name="theme"]');
  radios.forEach(radio => {
    radio.checked = radio.value === savedTheme;
    radio.addEventListener("change", (e) => {
      const newTheme = e.target.value;
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  });
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
