import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Hash, Mail, Calendar, BookOpen, GitBranch, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import "./RegisterPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    email: "",
    batchYear: "",
    course: "",
    branch: "",
    section: "",
    leetcodeUserName: "",
    geeksforgeeksUserName: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/tracker/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          batchYear: Number(form.batchYear),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed");
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Registered successfully!");
      navigate("/success");
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-glow"></div>

      <div className="register-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <form onSubmit={handleSubmit} className="register-card glass-card fade-in-up">
          <div className="register-header">
            <h2>Student Registration</h2>
            <p>Enter your details to start tracking your coding progress</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <User size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <div className="form-input-icon">
                <Hash size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="rollNumber"
                  placeholder="e.g., 2303630100029"
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input-icon">
                <Mail size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Batch Year</label>
              <div className="form-input-icon">
                <Calendar size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="batchYear"
                  type="number"
                  placeholder="e.g., 2026"
                  value={form.batchYear}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Course</label>
              <div className="form-input-icon">
                <BookOpen size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="course"
                  placeholder="e.g., BTech"
                  value={form.course}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Branch</label>
              <div className="form-input-icon">
                <GitBranch size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="branch"
                  placeholder="e.g., CSE"
                  value={form.branch}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <div className="form-input-icon">
                <LayoutGrid size={16} className="input-prefix-icon" />
                <input
                  className="form-input"
                  name="section"
                  placeholder="e.g., A"
                  value={form.section}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>
          </div>

          {/* Platform Section */}
          <div className="platform-section">
            <h3 className="platform-title">Coding Platforms</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="badge badge-lc">LC</span> LeetCode Username
                </label>
                <input
                  className="form-input"
                  name="leetcodeUserName"
                  placeholder="Your LeetCode username"
                  value={form.leetcodeUserName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="badge badge-gfg">GFG</span> GeeksforGeeks Username
                </label>
                <input
                  className="form-input"
                  name="geeksforgeeksUserName"
                  placeholder="Your GFG username"
                  value={form.geeksforgeeksUserName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
