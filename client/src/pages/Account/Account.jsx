import { useActionState, use } from "react";
import { AuthContext } from "../../context/AuthContext.js";
import { changePassword } from "../../api/queries.js";

export default function Account() {
  const { token, user } = use(AuthContext);

  const [state, submitAction, isPending] = useActionState(
    async (_prev, formData) => {
      const current = formData.get("current");
      const password = formData.get("password");
      const confirm = formData.get("confirm");

      if (password !== confirm) {
        return { success: false, error: "Passwords do not match." };
      }

      try {
        await changePassword({
          token,
          currentPassword: current,
          newPassword: password,
        });
        return { success: true, error: null };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    { success: false, error: null }
  );

  if (!token) return <p>Log in to view your account.</p>;

  return (
    <>
      <header>
        <h1>Account</h1>
      </header>

      <div className="account-info">
        <div className="account-field">
          <span className="account-label">Username</span>
          <span className="account-value">{user?.username}</span>
        </div>
        <div className="account-field">
          <span className="account-label">Email</span>
          <span className="account-value">{user?.email}</span>
        </div>
        <div className="account-field">
          <span className="account-label">Email Verified</span>
          <span className="account-value">
            {user?.emailVerified ? "Yes" : "No"}
          </span>
        </div>
      </div>

      <div className="account-password">
        <h3>Change Password</h3>
        <form action={submitAction}>
          <label>
            Current Password
            <input type="password" name="current" required />
          </label>
          <label>
            New Password
            <input type="password" name="password" required />
          </label>
          <label>
            Confirm New Password
            <input type="password" name="confirm" required />
          </label>
          <button disabled={isPending}>
            {isPending ? "Updating..." : "Change Password"}
          </button>
          {state.error && <p role="alert">{state.error}</p>}
          {state.success && <p className="success-msg">Password updated!</p>}
        </form>
      </div>
    </>
  );
}
