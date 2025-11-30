// frontend/js/auth.js
// ========================================
// Under Water 2 - Authentication Logic
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

console.log("🔵 Auth.js module loading...");

// DOM elements
let authScreen, appShell, loginTab, signupTab, loginForm, signupForm;
let loginError, signupError, forgotError, resetError;
let forgotPasswordForm, resetPasswordForm, forgotPasswordLink;
let backToLoginFromForgot, backToLoginFromReset;
let userEmailLabel, logoutBtn;

// Initialize and cache all DOM elements
function initDOMElements() {
  console.log("📍 Initializing DOM elements...");
  
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

  console.log("✅ Elements initialized:", {
    loginTab: !!loginTab,
    signupTab: !!signupTab,
    loginForm: !!loginForm,
    signupForm: !!signupForm
  });

  attachAllListeners();
}

// Attach all event listeners
function attachAllListeners() {
  console.log("🔗 Attaching event listeners...");

  // LOGIN TAB
  if (loginTab) {
    loginTab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🟢 Login tab clicked");
      
      if (signupTab) signupTab.classList.remove("auth-tab-active");
      loginTab.classList.add("auth-tab-active");
      
      if (signupForm) signupForm.classList.add("auth-form-hidden");
      if (loginForm) loginForm.classList.remove("auth-form-hidden");
      if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      
      return false;
    });
    console.log("✅ Login tab listener attached");
  }

  // SIGNUP TAB
  if (signupTab) {
    signupTab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🟢 Signup tab clicked");
      
      if (loginTab) loginTab.classList.remove("auth-tab-active");
      signupTab.classList.add("auth-tab-active");
      
      if (loginForm) loginForm.classList.add("auth-form-hidden");
      if (signupForm) signupForm.classList.remove("auth-form-hidden");
      if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      
      return false;
    });
    console.log("✅ Signup tab listener attached");
  }

  // FORGOT PASSWORD LINK
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🟢 Forgot password link clicked");
      
      if (loginForm) loginForm.classList.add("auth-form-hidden");
      if (signupForm) signupForm.classList.add("auth-form-hidden");
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      if (forgotPasswordForm) forgotPasswordForm.classList.remove("auth-form-hidden");
      if (forgotError) forgotError.textContent = "";
    });
  }

  // BACK BUTTONS
  if (backToLoginFromForgot) {
    backToLoginFromForgot.addEventListener("click", (e) => {
      e.preventDefault();
      if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
      if (loginForm) loginForm.classList.remove("auth-form-hidden");
      if (forgotError) forgotError.textContent = "";
    });
  }

  if (backToLoginFromReset) {
    backToLoginFromReset.addEventListener("click", (e) => {
      e.preventDefault();
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      if (loginForm) loginForm.classList.remove("auth-form-hidden");
      if (resetError) resetError.textContent = "";
    });
  }

  // FORGOT PASSWORD FORM
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (forgotError) forgotError.textContent = "";

      const email = document.getElementById("forgot-email").value.trim();

      try {
        const res = await apiForgotPassword(email);
        console.log("✅ Reset code sent:", res.resetCode);
        alert(`Reset code: ${res.resetCode}\n\n(In production, this would be sent via email)`);
        
        if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
        if (resetPasswordForm) resetPasswordForm.classList.remove("auth-form-hidden");
        document.getElementById("reset-email").value = email;
      } catch (err) {
        if (forgotError) forgotError.textContent = err.message;
      }
    });
  }

  // RESET PASSWORD FORM
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (resetError) resetError.textContent = "";

      const email = document.getElementById("reset-email").value.trim();
      const resetCode = document.getElementById("reset-code").value.trim();
      const newPassword = document.getElementById("reset-new-password").value.trim();

      try {
        await apiResetPassword(email, resetCode, newPassword);
        alert("✅ Password reset successful! Please log in.");
        
        if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
        if (loginForm) loginForm.classList.remove("auth-form-hidden");
        if (loginForm) loginForm.reset();
        if (resetPasswordForm) resetPasswordForm.reset();
      } catch (err) {
        if (resetError) resetError.textContent = err.message;
      }
    });
  }

  // SIGNUP FORM
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (signupError) signupError.textContent = "";

      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value.trim();

      try {
        const res = await apiSignup(email, password);
        setToken(res.token);
        if (userEmailLabel) userEmailLabel.textContent = res.user.email;
        showApp();
      } catch (err) {
        if (signupError) signupError.textContent = err.message;
      }
    });
  }

  // LOGIN FORM
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (loginError) loginError.textContent = "";

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      try {
        const res = await apiLogin(email, password);
        setToken(res.token);
        if (userEmailLabel) userEmailLabel.textContent = res.user.email;
        showApp();
      } catch (err) {
        if (loginError) loginError.textContent = err.message;
      }
    });
  }

  // LOGOUT BUTTON
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      stopInactivityTracking();
      clearToken();
      showAuth();
    });
  }

  console.log("✅ All event listeners attached");
}

// Verify token on page load
export async function checkAuthOnLoad() {
  console.log("🚀 Checking auth on load...");
  initDOMElements();
  
  const token = getToken();
  if (!token) {
    console.log("❌ No token found, showing auth screen");
    showAuth();
    return;
  }

  try {
    const res = await apiVerify();
    if (userEmailLabel) userEmailLabel.textContent = res.user.email;
    console.log("✅ Token verified, showing app");
    showApp();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    clearToken();
    showAuth();
  }
}

// Show Auth Screen
export function showAuth() {
  console.log("📺 Showing auth screen");
  if (authScreen) {
    authScreen.style.visibility = "visible";
    authScreen.classList.remove("app-shell-hidden");
  }
  if (appShell) {
    appShell.style.visibility = "hidden";
    appShell.classList.add("app-shell-hidden");
  }
  stopInactivityTracking();
}

// Show Main App
function showApp() {
  console.log("📺 Showing app");
  if (appShell) {
    appShell.style.visibility = "visible";
    appShell.classList.remove("app-shell-hidden");
  }
  if (authScreen) {
    authScreen.style.visibility = "hidden";
    authScreen.classList.add("app-shell-hidden");
  }

  initInactivityTracking();
  const savedView = getSavedView();
  showView(savedView);
}
