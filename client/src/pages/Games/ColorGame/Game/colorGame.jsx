import { useState, useEffect, use, useRef } from "react";
import { AuthContext } from "../../../../context/AuthContext.js";
import { createScore } from "../../../../api/queries.js";
import { generateColors } from "../Logic/colors.js";

/**
 * Pick the odd-colored block from a grid. Each correct pick advances the round
 * and tightens the color difference. Score = rounds completed before a miss.
 *
 * Changed to use Canvas to hide RGB elements within page inspection
 */

const COLS = 3;
const ROWS = 2;
const BLOCK = 100;
const GAP = 10;
const W = COLS * BLOCK + (COLS - 1) * GAP; // 320
const H = ROWS * BLOCK + (ROWS - 1) * GAP; // 210

export default function ColorGame() {
  const { token } = use(AuthContext);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

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

  /**
   * Handles the user clicks on the canvas elements
   * by grabbing the DOMRect object with the properties:
   * left, top, right, bottom, x, y, width and height
   */
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect(); // on-screen canvas dimensions and position
    const scaleX = canvasRef.current.width / rect.width; // if the internal res is different from...
    const scaleY = canvasRef.current.height / rect.height; // ...displayed resolution
    const x = (e.clientX - rect.left) * scaleX; // click position subtracted by the absolute position...
    const y = (e.clientY - rect.top) * scaleY; // ...to get the relative position

    // check which cell was clicked
    const col = Math.floor(x / (BLOCK + GAP));
    const row = Math.floor(y / (BLOCK + GAP));

    // ignore clicks in the gaps between blocks
    if (x - col * (BLOCK + GAP) > BLOCK) return;
    if (y - row * (BLOCK + GAP) > BLOCK) return;
    if (col >= COLS || row >= ROWS) return;

    // converts grid back to flat index (1 * 3 + 2) = 5
    const i = row * COLS + col;

    // handle the game state
    setGame((prev) => {
      if (prev.over) return prev; // game over - ignore click
      // if user clicks the "odd one out" - winning color
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

  /**
   * Color Game "anti-cheat" - Hide the RGB values
   * so players cannot view them within the HTML inspect
   * by changing div elements to canvas elements
   */
  useEffect(() => {
    // getContext("2d") grabs 2d drawing tools for canvas
    const ctx = canvasRef.current?.getContext("2d"); // ?. if not yet mounted
    if (!ctx || game.colors.length === 0) return; //

    ctx.clearRect(0, 0, W, H); // wipe canvas clean every round
    game.colors.forEach((color, i) => {
      // iterate through our colors
      const col = i % COLS; // convert flat index (0-5)...
      const row = Math.floor(i / COLS); // ...into grid position
      const x = col * (BLOCK + GAP); // pixel position for rectangles for x...
      const y = row * (BLOCK + GAP); // and y
      ctx.fillStyle = color; // filling it with our color
      ctx.beginPath(); // starts new "drawing"
      ctx.roundRect(x, y, BLOCK, BLOCK, 8); // define roundness of colored blocks
      ctx.fill(); // fills our colored blocks
    });
  }, [game.colors]);

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
          {/* Replaced div with canvas for "anti-cheat" */}
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="color-canvas"
            onClick={handleCanvasClick}
          />
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
