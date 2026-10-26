import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
      </Routes>
    </BrowserRouter>
  );
}