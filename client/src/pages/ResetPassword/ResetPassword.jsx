import { useActionState } from "react";
import { useSearchParams, Link } from "react-router";
import { HOST } from "../../context/AuthContext.js";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, submitAction, isPending] = useActionState(
    async (_prev, formData) => {
      const password = formData.get("password");
      const confirm = formData.get("confirm");

      if (password !== confirm) {
        return { success: false, error: "Passwords do not match." };
      }

      try {
        const res = await fetch(`${HOST}api/users/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const message = await res.text();
        if (!res.ok) return { success: false, error: message };
        return { success: true, error: null };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    { success: false, error: null }
  );

  if (!token) {
    return (
      <div className="Login-Page">
        <div className="Login-Box">
          <h1>Reset Password</h1>
          <p>Invalid reset link. No token provided.</p>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="Login-Page">
      <div className="Login-Box">
        <h1>Reset Password</h1>

        {state.success ? (
          <>
            <p>Password updated! You can now log in.</p>
            <Link to="/login">Go to Login</Link>
          </>
        ) : (
          <form action={submitAction}>
            <label>
              New Password
              <input type="password" name="password" required />
            </label>
            <label>
              Confirm Password
              <input type="password" name="confirm" required />
            </label>
            <button disabled={isPending}>
              {isPending ? "Resetting..." : "Reset Password"}
            </button>
            {state.error && <p role="alert">{state.error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
