import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext.js";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const tryLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await login({ username, password });
      navigate("/home");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="Login-Page">
      <div className="Login-Box">
        <h1>Login</h1>

        <form onSubmit={tryLogin}>
          <label>
            Username
            <input type="text" name="username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button>Login</button>
          {error && <p role="alert">{error}</p>}
        </form>

        <p>Don't have an account yet?</p>
        <Link to="/register">Register here</Link>

        <p>Forgot your password?</p>
        <Link to="/recover">Recover password</Link>
      </div>
    </div>
  );
}
