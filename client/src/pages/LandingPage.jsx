import { Link } from "react-router-dom";
import { BarChart3, Trophy, FileSpreadsheet, ArrowRight } from "lucide-react";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing">
      {/* Background glow effects */}
      <div className="landing-glow landing-glow-1"></div>
      <div className="landing-glow landing-glow-2"></div>

      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-logo">All Eyes On You</span>
        <Link to="/login" className="btn btn-outline btn-sm">
          Admin Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="hero fade-in-up">
        <div className="hero-badge">AIMT Placement Cell</div>
        <h1 className="hero-title">
          Track Your <span className="hero-highlight">Coding Journey</span>
        </h1>
        <p className="hero-subtitle">
          Monitor LeetCode & GeeksforGeeks progress across all batches.
          Automated daily tracking, live leaderboards, and instant Excel reports.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            Register as Student <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline">
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features fade-in-up">
        <div className="feature-card glass-card">
          <div className="feature-icon">
            <BarChart3 size={28} />
          </div>
          <h3>Daily Tracking</h3>
          <p>
            Your LeetCode and GFG stats are automatically fetched every night at
            midnight. Zero effort from your side.
          </p>
        </div>
        <div className="feature-card glass-card">
          <div className="feature-icon">
            <Trophy size={28} />
          </div>
          <h3>Live Leaderboard</h3>
          <p>
            See where you stand among your peers. Filter by batch, branch, and
            track your rank over time.
          </p>
        </div>
        <div className="feature-card glass-card">
          <div className="feature-icon">
            <FileSpreadsheet size={28} />
          </div>
          <h3>Excel Reports</h3>
          <p>
            Placement faculty can export the complete leaderboard to Excel with
            a single click. Ready for presentations.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Built for AIMT Placement Cell · All Eyes On You © 2026</p>
      </footer>
    </div>
  );
}

export default LandingPage;
