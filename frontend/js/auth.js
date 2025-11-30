// frontend/js/auth.js
// ========================================
// Under Water 2 - Authentication Logic
// Handles login, signup, logout, and token verify
// ========================================

import {
  setToken,
  clearToken,
  getToken,
} from "./config.js";

import {
  apiLogin,
  apiSignup,
  apiVerify,
  apiForgotPassword,
  apiResetPassword,
} from "./api.js";

import { showView, getSavedView } from "./ui.js";
import { initInactivityTracking, stopInactivityTracking } from "./inactivity.js";

// Initialize auth module with DOM elements - DEFERRED until DOM is ready
console.log("🔵 Auth.js loading...");

let authScreen, appShell, loginTab, signupTab, loginForm, signupForm, loginError, signupError, forgotError, resetError, forgotPasswordForm, resetPasswordForm, forgotPasswordLink, backToLoginFromForgot, backToLoginFromReset, userEmailLabel, logoutBtn;

// Cache DOM elements once they're available
function initAuthElements() {
  authScreen = document.getElementById("auth-screen");
  appShell = document.getElementById("app-shell");
  loginTab = document.getElementById("login-tab");
  signupTab = document.getElementById("signup-tab");
  loginForm = document.getElementById("login-form");
  signupForm = document.getElementById("signup-form");
  loginError = document.getElementById("login-error");
  signupError = document.getElementById("signup-error");
  forgotError = document.getElementById("forgot-error");
  resetError = document.getElementById("reset-error");
  forgotPasswordForm = document.getElementById("forgot-password-form");
  resetPasswordForm = document.getElementById("reset-password-form");
  forgotPasswordLink = document.getElementById("forgot-password-link");
  backToLoginFromForgot = document.getElementById("back-to-login-from-forgot");
  backToLoginFromReset = document.getElementById("back-to-login-from-reset");
  userEmailLabel = document.getElementById("user-email-label");
  logoutBtn = document.getElementById("logout-btn");

  console.log("✅ Auth elements initialized");
  attachTabListeners();
}

// Simple tab switcher function
function switchToSignup() {
  console.log("🟢 Switching to signup...");
  if (signupTab) signupTab.classList.add("auth-tab-active");
  if (loginTab) loginTab.classList.remove("auth-tab-active");
  if (signupForm) signupForm.classList.remove("auth-form-hidden");
  if (loginForm) loginForm.classList.add("auth-form-hidden");
  if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
  if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
}

function switchToLogin() {
  console.log("🟢 Switching to login...");
  if (loginTab) loginTab.classList.add("auth-tab-active");
  if (signupTab) signupTab.classList.remove("auth-tab-active");
  if (loginForm) loginForm.classList.remove("auth-form-hidden");
  if (signupForm) signupForm.classList.add("auth-form-hidden");
  if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
  if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
}

// Attach tab click listeners - called after DOM is ready
function attachTabListeners() {
  if (loginTab) {
    loginTab.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchToLogin();
      return false;
    };
    console.log("✅ Login tab listener attached");
  }

  if (signupTab) {
    signupTab.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchToSignup();
      return false;
    };
    console.log("✅ Signup tab listener attached");
  }
}

// Forgot Password Link - wrapped for deferred init
function attachForgotPasswordLink() {
  if (!forgotPasswordLink) return;
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
  loginForm.classList.add("auth-form-hidden");
  signupForm.classList.add("auth-form-hidden");
  resetPasswordForm.classList.add("auth-form-hidden");
  forgotPasswordForm.classList.remove("auth-form-hidden");
  forgotError.textContent = "";
});

  });
}

function attachBackButtons() {
  if (backToLoginFromForgot) backToLoginFromForgot.addEventListener("click", (e) => {
    e.preventDefault();
  forgotPasswordForm.classList.add("auth-form-hidden");
  loginForm.classList.remove("auth-form-hidden");
  forgotError.textContent = "";
});

  });

  if (backToLoginFromReset) backToLoginFromReset.addEventListener("click", (e) => {
    e.preventDefault();
  resetPasswordForm.classList.add("auth-form-hidden");
  loginForm.classList.remove("auth-form-hidden");
  resetError.textContent = "";
  });
}

// Forgot Password Form - wrapped for deferred init
function attachFormListeners() {
  if (forgotPasswordForm) forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  forgotError.textContent = "";

  const email = document.getElementById("forgot-email").value.trim();

  try {
    const res = await apiForgotPassword(email);
    console.log("✅ Reset code sent:", res.resetCode);
    alert(`Reset code: ${res.resetCode}\n\n(In production, this would be sent via email)`);
    
    // Move to reset password form
    forgotPasswordForm.classList.add("auth-form-hidden");
    resetPasswordForm.classList.remove("auth-form-hidden");
    document.getElementById("reset-email").value = email;
  } catch (err) {
    forgotError.textContent = err.message;
  }
  });

  if (resetPasswordForm) resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resetError.textContent = "";

  const email = document.getElementById("reset-email").value.trim();
  const resetCode = document.getElementById("reset-code").value.trim();
  const newPassword = document.getElementById("reset-new-password").value.trim();

  try {
    await apiResetPassword(email, resetCode, newPassword);
    alert("✅ Password reset successful! Please log in.");
    
    // Clear forms and go back to login
    resetPasswordForm.classList.add("auth-form-hidden");
    loginForm.classList.remove("auth-form-hidden");
    loginForm.reset();
    resetPasswordForm.reset();
  } catch (err) {
    resetError.textContent = err.message;
  }
  });

  if (signupForm) signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent = "";

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  try {
    const res = await apiSignup(email, password);
    setToken(res.token);
    userEmailLabel.textContent = res.user.email;

    showApp();
  } catch (err) {
    signupError.textContent = err.message;
  }
  });

  if (loginForm) loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const res = await apiLogin(email, password);
    setToken(res.token);
    userEmailLabel.textContent = res.user.email;

    showApp();
  } catch (err) {
    loginError.textContent = err.message;
  }
  });

  if (logoutBtn) logoutBtn.addEventListener("click", () => {
  stopInactivityTracking();
  clearToken();
  showAuth();
  });
}

// Initialize all event listeners when called
function initAuthListeners() {
  initAuthElements();
  attachForgotPasswordLink();
  attachBackButtons();
  attachFormListeners();
}

// Export init function
export { initAuthListeners };

// Verify token on page load
export async function checkAuthOnLoad() {
  initAuthListeners();
  const token = getToken();
  if (!token) {
    showAuth();
    return;
  }

  try {
    const res = await apiVerify();
    userEmailLabel.textContent = res.user.email;
    showApp();
  } catch (err) {
    clearToken();
    showAuth();
  }
}

// ----------------------------------------------
// Show Auth Screen
// ----------------------------------------------
export function showAuth() {
  // Ensure visibility is set before removing hidden class
  authScreen.style.visibility = "visible";
  appShell.style.visibility = "hidden";
  
  stopInactivityTracking();
  authScreen.classList.remove("app-shell-hidden");
  appShell.classList.add("app-shell-hidden");
}

// ----------------------------------------------
// Show Main App
// ----------------------------------------------
function showApp() {
  // Ensure visibility is set before removing hidden class
  appShell.style.visibility = "visible";
  authScreen.style.visibility = "hidden";
  
  authScreen.classList.add("app-shell-hidden");
  appShell.classList.remove("app-shell-hidden");

  // Start inactivity tracking when user logs in
  initInactivityTracking();

  // Restore saved view from session, or default to dashboard
  const savedView = getSavedView();
  showView(savedView);
}