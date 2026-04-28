import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import "./SuccessPage.css";

function SuccessPage() {
  return (
    <div className="success-page">
      <div className="success-glow"></div>

      <div className="success-card glass-card scale-in">
        <div className="success-icon-wrapper">
          <CheckCircle size={56} />
        </div>

        <h2>Registration Successful!</h2>

        <p className="success-message">
          Your coding profiles will be tracked starting{" "}
          <strong>tonight at midnight</strong>. The system automatically fetches
          your LeetCode and GeeksforGeeks stats every day.
        </p>

        <p className="success-hint">
          Check the leaderboard tomorrow to see your rank!
        </p>

        <Link to="/" className="btn btn-primary">
          Back to Home <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default SuccessPage;
