import { useActionState, use } from "react";
import { Link, useNavigate } from "react-router";

import { AuthContext } from "../../context/AuthContext.js";

export default function Register() {
  const { register } = use(AuthContext);
  const navigate = useNavigate();

  const [error, submitAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const username = formData.get("username");
      const email = formData.get("email");
      const password = formData.get("password");
      try {
        await register({ username, email, password });
        navigate("/");
        return null;
      } catch (e) {
        return e.message;
      }
    },
    null
  );

  return (
    <div className="Register-Page">
      <div className="Register-Box">
        <h1>Register</h1>

        <form action={submitAction}>
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
          <button disabled={isPending}>
            {isPending ? "Registering..." : "Register"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>

        <p>Already have an account?</p>
        <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
