import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { verifyEmail } from "../../api/queries.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    verifyEmail(token)
      .then(({ ok, message }) => {
        setStatus(ok ? "success" : "error");
        setMessage(message);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="Login-Page">
      <div className="Login-Box">
        <h1>Email Verification</h1>
        {status === "verifying" && <p>Verifying your email...</p>}
        {status === "success" && (
          <>
            <p>{message}</p>
            <Link to="/">Go to Home</Link>
          </>
        )}
        {status === "error" && (
          <>
            <p role="alert">{message}</p>
            <Link to="/">Go to Home</Link>
          </>
        )}
      </div>
    </div>
  );
}
