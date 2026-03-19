import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <header>
        <h1>BetterThanYou</h1>
      </header>

      <div className="game-selection-block">
        <Link to="/games/color-game" className="game-tile">
          <h2>Color Game</h2>
          <img src="/color-game-preview.png" alt="Color Game" />
        </Link>

        <Link to="/games/typing-speed" className="game-tile">
          <h2>Typing Speed</h2>
          <img src="/typing-speed-preview.png" alt="Typing Speed" />
        </Link>
      </div>
    </>
  );
}
