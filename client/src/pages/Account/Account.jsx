import { useActionState, use } from "react";
import { AuthContext, HOST } from "../../context/AuthContext.js";

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
        const res = await fetch(`${HOST}api/users/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ current_password: current, new_password: password }),
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
            {user?.email_verified ? "Yes" : "No"}
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
