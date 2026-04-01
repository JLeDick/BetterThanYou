import { useActionState, use } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext.js";

export default function Login() {
  const { login } = use(AuthContext);
  const navigate = useNavigate();

  const [error, submitAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const username = formData.get("username");
      const password = formData.get("password");
      try {
        await login({ username, password });
        navigate("/");
        return null;
      } catch (e) {
        return e.message;
      }
    },
    null
  );

  return (
    <div className="Login-Page">
      <div className="Login-Box">
        <h1>Login</h1>

        <form action={submitAction}>
          <label>
            Username
            <input type="text" name="username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </button>
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
