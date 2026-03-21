import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import ColorGame from "./pages/Games/ColorGame/Game/colorGame";
import TypingSpeed from "./pages/Games/TypingSpeed/TypingSpeed";
import Compare from "./pages/Compare/Compare";
import Stats from "./pages/Stats/Stats";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Group from "./pages/Group/Group";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/games/color-game" element={<ColorGame />} />
        <Route path="/games/typing-speed" element={<TypingSpeed />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/groups" element={<Group />} />
      </Route>
    </Routes>
  );
}

export default App;
