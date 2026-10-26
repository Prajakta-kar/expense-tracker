import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8081/api" });

export const CATEGORIES = [
  { name: "Food", color: "#FF5C8A" },
  { name: "Rent", color: "#5B3DF5" },
  { name: "Travel", color: "#2ED3A6" },
  { name: "Bills", color: "#FFC233" },
  { name: "Fun", color: "#14213D" },
];

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