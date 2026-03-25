import { useState, useEffect } from "react";
import { AuthContext, HOST } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  // On page load, if a token exists, fetch the user data
  useEffect(() => {
    if (!token) return;
    fetch(`${HOST}api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
  }, []);

  const register = async ({ username, email, password }) => {
    const response = await fetch(`${HOST}api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password_hash: password }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }

    const newToken = await response.text();
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // gets username for stats => const { user } = useContext(AuthContext)
    // use user.id and user.username
    const meResponse = await fetch(`${HOST}api/users/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    const userData = await meResponse.json();
    setUser(userData);
  };

  const login = async ({ username, password }) => {
    const response = await fetch(`${HOST}api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password_hash: password }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }

    const newToken = await response.text();
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // same as above
    const meResponse = await fetch(`${HOST}api/users/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    const userData = await meResponse.json();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
