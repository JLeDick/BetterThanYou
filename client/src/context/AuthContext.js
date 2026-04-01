import { createContext } from "react";

export const AuthContext = createContext();
export const HOST = import.meta.env.VITE_API_URL || "http://localhost:3000/";
