import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";
import "./LoginPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials");
        toast.error(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("faculty", JSON.stringify(data.data.faculty));
      toast.success(`Welcome back, ${data.data.faculty.name}!`);
      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow"></div>

      <div className="login-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <form onSubmit={handleSubmit} className="login-card glass-card fade-in-up">
          <div className="login-icon-wrapper">
            <Shield size={32} />
          </div>

          <div className="login-header">
            <h2>Placement Admin</h2>
            <p>Sign in to access the dashboard</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              placeholder="admin@college.edu.in"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Password</label>
            <div className="form-input-icon">
              <input
                className="form-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                Signing in...
              </>
            ) : (
              <>
                <Lock size={16} /> Sign In
              </>
            )}
          </button>

          <p className="login-footer-text">Authorized faculty members only</p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
