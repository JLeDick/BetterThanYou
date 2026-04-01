import { Routes, Route } from "react-router";

import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import ColorGame from "./pages/Games/ColorGame/Game/colorGame";
import TypingSpeed from "./pages/Games/TypingSpeed/Game/TypingSpeed";
import CoinGame from "./pages/Games/CoinGame/Game/CoinGame";
import Compare from "./pages/Compare/Compare";
import Stats from "./pages/Stats/Stats";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Group from "./pages/Group/Group";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Account from "./pages/Account/Account";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route index element={<Home />} />
        <Route path="/games/color-game" element={<ColorGame />} />
        <Route path="/games/typing-speed" element={<TypingSpeed />} />
        <Route path="/games/coin-game" element={<CoinGame />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/groups" element={<Group />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
