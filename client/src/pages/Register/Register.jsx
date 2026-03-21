import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext.js";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const tryRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await register({ username, email, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="Register-Page">
      <div className="Register-Box">
        <h1>Register</h1>

        <form onSubmit={tryRegister}>
          <label>
            Username
            <input type="text" name="username" required />
          </label>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button>Register</button>
          {error && <p role="alert">{error}</p>}
        </form>

        <p>Already have an account?</p>
        <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
