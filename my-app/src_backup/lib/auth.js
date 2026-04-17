const USERS_KEY = "shopeers_users_v1";
const CURRENT_USER_KEY = "shopeers_current_user_v1";
const TOKEN_KEY = "access_token";
const BASE = import.meta.env.VITE_API_URL || '/api/auth'

function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(String(input));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  return safeJsonParse(localStorage.getItem(CURRENT_USER_KEY), null);
}

export function listUsers() {
  return safeJsonParse(localStorage.getItem(USERS_KEY), []);
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser({ name, email, password }) {
  const cleanedEmail = normalizeEmail(email);
  const cleanedName = String(name || "").trim();
  const cleanedPassword = String(password || "");

  if (!cleanedName) throw new Error("Please enter your name.");
  if (!cleanedEmail || !cleanedEmail.includes("@")) throw new Error("Please enter a valid email.");
  if (cleanedPassword.length < 8) throw new Error("Password must be at least 8 characters.");

  const users = listUsers();
  if (users.some((u) => normalizeEmail(u.email) === cleanedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await sha256Hex(cleanedPassword);
  const newUser = {
    id: crypto.randomUUID?.() || randomToken(),
    name: cleanedName,
    email: cleanedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [newUser, ...users];
  saveUsers(nextUsers);

  const token = randomToken();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name: newUser.name, email: newUser.email }));
  return { token, user: { name: newUser.name, email: newUser.email } };
}

export async function loginLocal({ email, password }) {
  const cleanedEmail = normalizeEmail(email);
  const cleanedPassword = String(password || "");

  if (!cleanedEmail || !cleanedEmail.includes("@")) throw new Error("Please enter a valid email.");
  if (!cleanedPassword) throw new Error("Please enter your password.");

  const users = listUsers();
  const user = users.find((u) => normalizeEmail(u.email) === cleanedEmail);
  if (!user) throw new Error("No account found for this email. Please sign up.");

  const passwordHash = await sha256Hex(cleanedPassword);
  if (passwordHash !== user.passwordHash) throw new Error("Incorrect password.");

  const token = randomToken();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name: user.name, email: user.email }));
  return { token, user: { name: user.name, email: user.email } };
}

