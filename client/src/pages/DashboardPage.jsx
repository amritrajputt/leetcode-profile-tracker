import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, LogOut, Users, Code, Trophy, Layers } from "lucide-react";
import toast from "react-hot-toast";
import "./DashboardPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

function DashboardPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const faculty = JSON.parse(localStorage.getItem("faculty") || "{}");

  // Auth guard
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch leaderboard data
  useEffect(() => {
    if (!token) return;
    fetchLeaderboard();
  }, [batch, token]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = batch
        ? `${API_BASE}/tracker/leaderboard?batch=${batch}`
        : `${API_BASE}/tracker/leaderboard`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("faculty");
          navigate("/login");
          return;
        }
        toast.error(data.message || "Failed to fetch data");
        return;
      }

      setStudents(data.data || []);
    } catch (err) {
      toast.error("Network error while fetching leaderboard");
    } finally {
      setLoading(false);
    }
  };

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        (s.branch && s.branch.toLowerCase().includes(q))
    );
  }, [students, search]);

  // Stats
  const stats = useMemo(() => {
    const total = students.length;
    const avgLc = total ? Math.round(students.reduce((s, st) => s + (Number(st.lcTotal) || 0), 0) / total) : 0;
    const avgGfg = total ? Math.round(students.reduce((s, st) => s + (Number(st.gfgTotal) || 0), 0) / total) : 0;
    const batches = [...new Set(students.map((s) => s.batchYear))].length;
    return { total, avgLc, avgGfg, batches };
  }, [students]);

  // Export Excel
  const handleExport = async () => {
    try {
      const url = batch
        ? `${API_BASE}/tracker/export?batch=${batch}`
        : `${API_BASE}/tracker/export`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error("Export failed");
        return;
      }

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `leaderboard${batch ? `_${batch}` : ""}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("Excel downloaded!");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("faculty");
    toast.success("Logged out");
    navigate("/");
  };

  // Get rank class
  const getRankClass = (i) => {
    if (i === 0) return "rank-gold";
    if (i === 1) return "rank-silver";
    if (i === 2) return "rank-bronze";
    return "";
  };

  // Get rank display
  const getRankDisplay = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return i + 1;
  };

  // Batch options (current year - 4 to current year + 1)
  const currentYear = new Date().getFullYear();
  const batchOptions = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-logo">All Eyes On You</span>
        <div className="navbar-actions">
          <span className="navbar-welcome">Hi, {faculty.name || "Admin"}</span>
          <select
            className="form-select"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          >
            <option value="">All Batches</option>
            {batchOptions.map((y) => (
              <option key={y} value={y}>
                Batch {y}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="page-padded">
        {/* Stats */}
        <div className="stats-grid fade-in-up">
          <div className="stat-card glass-card">
            <div className="stat-icon"><Users size={20} /></div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-lc"><Code size={20} /></div>
            <div className="stat-value">{stats.avgLc}</div>
            <div className="stat-label">Avg LeetCode</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-gfg"><Code size={20} /></div>
            <div className="stat-value">{stats.avgGfg}</div>
            <div className="stat-label">Avg GFG</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon"><Layers size={20} /></div>
            <div className="stat-value">{stats.batches}</div>
            <div className="stat-label">Batches</div>
          </div>
        </div>

        {/* Search + Table */}
        <div className="leaderboard-section fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="leaderboard-header">
            <h2><Trophy size={22} /> Leaderboard</h2>
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                className="form-input"
                placeholder="Search by name, roll number, or branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Loading leaderboard...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="loading-container">
              <span>No students found.</span>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Branch</th>
                    <th>Batch</th>
                    <th>LeetCode</th>
                    <th>GFG</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, i) => (
                    <tr key={student.id || i} className={getRankClass(i)}>
                      <td className="rank-cell">{getRankDisplay(i)}</td>
                      <td className="name-cell">{student.name}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.branch?.toUpperCase()}</td>
                      <td>{student.batchYear}</td>
                      <td>
                        <span className="badge badge-lc">{Number(student.lcTotal) || 0}</span>
                      </td>
                      <td>
                        <span className="badge badge-gfg">{Number(student.gfgTotal) || 0}</span>
                      </td>
                      <td className="total-cell">{Number(student.totalSolved) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
