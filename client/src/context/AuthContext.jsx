import { useState } from "react";
import { AuthContext } from "./AuthContext.js";

export const HOST = "http://localhost:3000/";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

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
