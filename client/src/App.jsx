import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SuccessPage from "./pages/SuccessPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            fontSize: "0.9rem",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
