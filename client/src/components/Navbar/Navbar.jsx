import { Link, useLocation } from "react-router";
import { AuthContext } from "../../context/AuthContext.js";
import { resendVerification } from "../../api/queries.js";
import { use, useState, useEffect } from "react";

export default function Navbar() {
  const { token, user, logout } = use(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleResendVerification = async () => {
    try {
      await resendVerification(token);
      alert("Verification email sent! Check your inbox.");
    } catch {
      alert("Failed to send email. Try again later.");
    }
  };

  const showBanner = token && user && !user.emailVerified && !bannerDismissed;

  return (
    <>
      <nav>
        <div className="nav-bar">
          <Link to="/" className="nav-brand">
            BetterThanYou
          </Link>
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "\u2715" : "\u2630"}
          </button>
        </div>
        <div className={`menu-dropdown${menuOpen ? " open" : ""}`}>
          {token ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/stats">Stats</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              <Link to="/compare">Compare</Link>
              <Link to="/groups">Groups</Link>
              <Link to="/account">Account</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      {showBanner && (
        <div className="verification-banner">
          <p>
            Please verify your email.{" "}
            <button onClick={handleResendVerification}>Resend email</button>
            <button onClick={() => setBannerDismissed(true)}>Dismiss</button>
          </p>
        </div>
      )}
    </>
  );
}
