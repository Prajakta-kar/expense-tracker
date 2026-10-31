import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

const TOKEN_KEY = "kharcha-token";
const USER_KEY = "kharcha-user";

export const CATEGORIES = [
  { name: "Food", color: "#FF5C8A" },
  { name: "Rent", color: "#5B3DF5" },
  { name: "Travel", color: "#2ED3A6" },
  { name: "Bills", color: "#FFC233" },
  { name: "Fun", color: "#14213D" },
];

/* ---------- login session ---------- */

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const isLoggedIn = () => Boolean(getToken());

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email }));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// send the token with every request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// if the token has expired, log out and go to the login page
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && getToken()) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ---------- auth ---------- */

export async function registerUser(name, email, password) {
  const res = await API.post("/auth/register", { name, email, password });
  saveSession(res.data);
  return res.data;
}

export async function loginUser(email, password) {
  const res = await API.post("/auth/login", { email, password });
  saveSession(res.data);
  return res.data;
}

/* ---------- expenses ---------- */

export async function getExpenses() {
  const res = await API.get("/expenses");
  return res.data;
}

export async function addExpense(data) {
  const res = await API.post("/expenses", data);
  return res.data;
}

export async function updateExpense(id, data) {
  const res = await API.put(`/expenses/${id}`, data);
  return res.data;
}

export async function deleteExpense(id) {
  await API.delete(`/expenses/${id}`);
}


/* ---------- budget ---------- */

export async function getBudget() {
  const res = await API.get("/budget");
  const limit = res.data.monthlyLimit;
  return limit === null || limit === undefined ? null : Number(limit);
}

export async function saveBudget(monthlyLimit) {
  const res = await API.put("/budget", { monthlyLimit });
  return Number(res.data.monthlyLimit);
}

export async function removeBudget() {
  await API.delete("/budget");
}