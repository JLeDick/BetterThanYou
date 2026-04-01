import { Link } from "react-router";

export default function Home() {
  return (
    <>
      <header>
        <h1>BetterThanYou</h1>
        <p className="tagline">Prove you're the best.</p>
      </header>

      <div className="game-selection-block">
        <Link to="/games/color-game" className="game-tile">
          <h2>Color Game</h2>
          <p>Find the odd color out</p>
        </Link>

        <Link to="/games/typing-speed" className="game-tile">
          <h2>Typing Test</h2>
          <p>Test your speed and accuracy</p>
        </Link>

        <Link to="/games/coin-game" className="game-tile">
          <h2>Coin Game</h2>
          <p>Precision shots on the tabletop</p>
        </Link>
      </div>
    </>
  );
}
