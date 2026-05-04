import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Users, Code, Trophy, Layers, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import "./DashboardPage.css"; // Reuse dashboard styles
import StudentChartModal from "./StudentChartModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

function PublicLeaderboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, [batch]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = batch
        ? `${API_BASE}/tracker/leaderboard?batch=${batch}`
        : `${API_BASE}/tracker/leaderboard`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
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

  // Batch options (current year to current year + 4)
  const currentYear = new Date().getFullYear();
  const batchOptions = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-logo">All Eyes On You</span>
        <div className="navbar-actions">
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} /> Back Home
          </Link>
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
            <h2><Trophy size={22} /> Public Leaderboard</h2>
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
                    <tr 
                      key={student.id || i} 
                      className={getRankClass(i)}
                      onClick={() => setSelectedStudent(student)}
                      style={{ cursor: "pointer" }}
                      title="Click to view progress chart"
                    >
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

      {selectedStudent && (
        <StudentChartModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
}

export default PublicLeaderboardPage;
