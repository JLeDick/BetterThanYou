import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.js";
import { useContext, useState } from "react";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav>
      <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      {menuOpen && (
        <div className="menu-dropdown">
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
      )}
    </nav>
  );
}
