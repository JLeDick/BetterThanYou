import { useActionState } from "react";
import { Link } from "react-router";
import { forgotPassword } from "../../api/queries.js";

export default function ForgotPassword() {
  const [state, submitAction, isPending] = useActionState(
    async (_prev, formData) => {
      const email = formData.get("email");
      try {
        const message = await forgotPassword(email);
        return { sent: true, message, error: null };
      } catch (e) {
        return { sent: false, message: null, error: e.message };
      }
    },
    { sent: false, message: null, error: null }
  );

  return (
    <div className="Login-Page">
      <div className="Login-Box">
        <h1>Forgot Password</h1>

        {state.sent ? (
          <>
            <p>{state.message}</p>
            <Link to="/login">Back to Login</Link>
          </>
        ) : (
          <form action={submitAction}>
            <label>
              Email
              <input type="email" name="email" required />
            </label>
            <button disabled={isPending}>
              {isPending ? "Sending..." : "Send Reset Link"}
            </button>
            {state.error && <p role="alert">{state.error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
