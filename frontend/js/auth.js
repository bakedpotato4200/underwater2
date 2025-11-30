// Under Water 2 - Authentication Module
// Handles login, signup, password recovery, token verification

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

let authScreen, appShell, loginTab, signupTab, loginForm, signupForm;
let loginError, signupError, forgotError, resetError;
let forgotPasswordForm, resetPasswordForm, forgotPasswordLink;
let backToLoginFromForgot, backToLoginFromReset;
let userEmailLabel, logoutBtn;

function initDOMElements() {
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

  attachAllListeners();
}

function attachAllListeners() {
  if (loginTab) {
    loginTab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (signupTab) signupTab.classList.remove("auth-tab-active");
      loginTab.classList.add("auth-tab-active");
      if (signupForm) signupForm.classList.add("auth-form-hidden");
      if (loginForm) loginForm.classList.remove("auth-form-hidden");
      if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      return false;
    });
  }

  if (signupTab) {
    signupTab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (loginTab) loginTab.classList.remove("auth-tab-active");
      signupTab.classList.add("auth-tab-active");
      if (loginForm) loginForm.classList.add("auth-form-hidden");
      if (signupForm) signupForm.classList.remove("auth-form-hidden");
      if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      return false;
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginForm) loginForm.classList.add("auth-form-hidden");
      if (signupForm) signupForm.classList.add("auth-form-hidden");
      if (resetPasswordForm) resetPasswordForm.classList.add("auth-form-hidden");
      if (forgotPasswordForm) forgotPasswordForm.classList.remove("auth-form-hidden");
      if (forgotError) forgotError.textContent = "";
    });
  }

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

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (forgotError) forgotError.textContent = "";

      const email = document.getElementById("forgot-email").value.trim();

      try {
        const res = await apiForgotPassword(email);
        alert(`Reset code: ${res.resetCode}\n\n(In production, this would be sent via email)`);
        if (forgotPasswordForm) forgotPasswordForm.classList.add("auth-form-hidden");
        if (resetPasswordForm) resetPasswordForm.classList.remove("auth-form-hidden");
        document.getElementById("reset-email").value = email;
      } catch (err) {
        if (forgotError) forgotError.textContent = err.message;
      }
    });
  }

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      stopInactivityTracking();
      clearToken();
      showAuth();
    });
  }
}

export async function checkAuthOnLoad() {
  initDOMElements();
  
  const token = getToken();
  if (!token) {
    showAuth();
    return;
  }

  try {
    const res = await apiVerify();
    if (userEmailLabel) userEmailLabel.textContent = res.user.email;
    showApp();
  } catch (err) {
    clearToken();
    showAuth();
  }
}

export function showAuth() {
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

function showApp() {
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
