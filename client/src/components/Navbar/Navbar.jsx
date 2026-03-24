import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.js";
import { useContext, useState, useEffect } from "react";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when navigating to a new page
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav>
      <div className="nav-bar">
        <Link to="/" className="nav-brand">
          BetterThanYou
        </Link>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
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
  );
}
