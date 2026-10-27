import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import { isLoggedIn } from "./api/expenseApi";

// only logged-in users can open this page
function Protected({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// logged-in users skip the login and register pages
function GuestOnly({ children }) {
  return isLoggedIn() ? <Navigate to="/expenses" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/expenses"
          element={<Protected><Expenses /></Protected>}
        />
        <Route
          path="/login"
          element={<GuestOnly><Auth mode="login" /></GuestOnly>}
        />
        <Route
          path="/register"
          element={<GuestOnly><Auth mode="register" /></GuestOnly>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/dashboard"
          element={<Protected><Dashboard /></Protected>}
        />
      </Routes>
    </BrowserRouter>
  );
}