// frontend/js/auth.js
// ========================================
// Underground Water 2 - Authentication Logic
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
} from "./api.js";

import { showView } from "./ui.js";

// DOM elements
const authScreen = document.getElementById("auth-screen");
const appShell = document.getElementById("app-shell");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");

const userEmailLabel = document.getElementById("user-email-label");
const logoutBtn = document.getElementById("logout-btn");

// ----------------------------------------------
// Toggle between Login and Signup tabs
// ----------------------------------------------
loginTab.addEventListener("click", () => {
  loginTab.classList.add("auth-tab-active");
  signupTab.classList.remove("auth-tab-active");
  loginForm.classList.remove("auth-form-hidden");
  signupForm.classList.add("auth-form-hidden");
});

signupTab.addEventListener("click", () => {
  signupTab.classList.add("auth-tab-active");
  loginTab.classList.remove("auth-tab-active");
  signupForm.classList.remove("auth-form-hidden");
  loginForm.classList.add("auth-form-hidden");
});

// ----------------------------------------------
// SIGNUP
// ----------------------------------------------
signupForm.addEventListener("submit", async (e) => {
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

// ----------------------------------------------
// LOGIN
// ----------------------------------------------
loginForm.addEventListener("submit", async (e) => {
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

// ----------------------------------------------
// LOGOUT
// ----------------------------------------------
logoutBtn.addEventListener("click", () => {
  clearToken();
  showAuth();
});

// ----------------------------------------------
// Verify token on page load
// ----------------------------------------------
export async function checkAuthOnLoad() {
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
function showAuth() {
  authScreen.classList.remove("app-shell-hidden");
  appShell.classList.add("app-shell-hidden");
}

// ----------------------------------------------
// Show Main App
// ----------------------------------------------
function showApp() {
  authScreen.classList.add("app-shell-hidden");
  appShell.classList.remove("app-shell-hidden");

  // Default view after login
  showView("dashboard-view");
}