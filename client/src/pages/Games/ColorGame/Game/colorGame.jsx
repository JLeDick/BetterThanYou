import { useState, useEffect, use } from "react";
import { AuthContext } from "../../../../context/AuthContext.js";
import { createScore } from "../../../../api/queries.js";
import { generateColors } from "../Logic/colors.js";

/**
 * Pick the odd-colored block from a grid. Each correct pick advances the round
 * and tightens the color difference. Score = rounds completed before a miss.
 */
export default function ColorGame() {
  const { token } = use(AuthContext);
  const [error, setError] = useState(null);

  const [game, setGame] = useState({
    started: false,
    over: false,
    round: 0,
    colors: [],
    oddIndex: null,
  });

  const startGame = () => {
    setError(null);
    const { colors, oddIndex } = generateColors(1);
    setGame({
      started: true,
      over: false,
      round: 1,
      colors,
      oddIndex,
    });
  };

  const handleClick = (i) => {
    setGame((prev) => {
      if (prev.over) return prev;
      if (i === prev.oddIndex) {
        const nextRound = prev.round + 1;
        const { colors, oddIndex } = generateColors(nextRound);
        return { ...prev, round: nextRound, colors, oddIndex };
      } else {
        return { ...prev, over: true };
      }
    });
  };

  // Submit score when game ends
  useEffect(() => {
    if (!game.over || !token) return;
    const score = game.round - 1;
    if (score <= 0) return;

    createScore({ token, gameId: 1, score }).catch((e) => setError(e.message));
  }, [game.over, game.round, token]);

  return (
    <>
      <header>
        <h1>Color Game</h1>
      </header>

      {!game.started && !game.over && (
        <div className="game-start">
          <p>Find the block that's a different shade. How far can you get?</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {game.started && !game.over && (
        <>
          <p className="round-display">Round: {game.round}</p>
          <div className="color-grid">
            {game.colors.map((color, i) => (
              <div
                key={`${game.round}-${i}`}
                className="color-block"
                style={{ backgroundColor: color }}
                onClick={() => handleClick(i)}
              />
            ))}
          </div>
        </>
      )}

      {game.over && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>You made it to round {game.round}.</p>
          <p>Score: {game.round - 1}</p>
          {!token && <p>Log in to save your scores!</p>}
          {error && <p role="alert">{error}</p>}
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </>
  );
}
