import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { HOST } from "../../context/AuthContext.js";

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

    fetch(`${HOST}api/users/verify/${token}`)
      .then(async (res) => {
        const text = await res.text();
        if (res.ok) {
          setStatus("success");
          setMessage(text);
        } else {
          setStatus("error");
          setMessage(text);
        }
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
