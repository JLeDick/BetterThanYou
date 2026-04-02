import { useState, useEffect, use, useRef } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { createScore } from "../../../../api/queries.js";
import calcWPM from "../Logic/wordsPerMinute";
import accuracyCalc from "../Logic/accuracyCalc";
import getRandomWords from "../Logic/wordSelection";
import calcScore from "../Logic/calcScore";

/**
 * 30-second typing test. Words are submitted on space. Score = WPM * (accuracy/100)^2,
 * so accuracy is heavily penalized to reward clean typing over raw speed.
 */
export default function TypingSpeed() {
  const { token } = use(AuthContext);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const wordsRef = useRef(null);
  const [mode, setMode] = useState(null);

  const [game, setGame] = useState({
    started: false,
    over: false,
    timerStarted: false,
    words: [],
    currentIndex: 0,
    results: [],
    timeLeft: 30,
  });

  const [input, setInput] = useState("");

  const startGame = () => {
    setError(null);
    setInput("");

    // Capitalize words for mobile users
    const words = getRandomWords();
    const displayWords =
      mode === "mobile"
        ? words.map((w) => w[0].toUpperCase() + w.slice(1))
        : words;

    setGame({
      started: true,
      over: false,
      timerStarted: false,
      words: displayWords,
      currentIndex: 0,
      results: [],
      timeLeft: 30,
    });
  };

  // Countdown timer - ends the game when it hits 0
  useEffect(() => {
    if (!game.timerStarted || game.over) return;

    const interval = setInterval(() => {
      setGame((prev) => {
        if (prev.timeLeft <= 1) {
          return { ...prev, over: true, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game.timerStarted, game.over]);

  // Submit score when game ends
  useEffect(() => {
    if (!game.over || !token) return;
    const score = calcScore(game.results);
    if (score <= 0) return;

    createScore({ token, gameId: 2, score }).catch((e) => setError(e.message));
  }, [game.over]);

  // Auto-scroll to keep current word visible
  useEffect(() => {
    if (!game.started || game.over) return;
    const currentEl = wordsRef.current?.querySelector(".typing-word.current");
    if (currentEl) {
      currentEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [game.currentIndex]);

  const handleInput = (e) => {
    // Start timer only after first input
    if (!game.timerStarted) {
      setGame((prev) => ({ ...prev, timerStarted: true }));
    }

    const value = e.target.value;

    // space pressed - submit current word
    if (value.endsWith(" ")) {
      const typed = value.trim();
      if (!typed) return;

      const currentWord = game.words[game.currentIndex];
      const correct = typed === currentWord;

      setGame((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        results: [...prev.results, { word: currentWord, typed, correct }],
      }));
      setInput("");
    } else {
      setInput(value);
    }
  };

  return (
    <>
      <header>
        <h1>Typing Speed</h1>
      </header>

      {/* Mode Selection - shows when mode isn't yet picked */}
      {!mode && (
        <div className="game-start">
          <p>Choose your input method:</p>
          <button onClick={() => setMode("keyboard")}>Keyboard</button>
          <button onClick={() => setMode("mobile")}>Mobile</button>
        </div>
      )}

      {/* Start screen - shows after mode picked, before game start */}
      {mode && !game.started && !game.over && (
        <div className="game-start">
          <p>30 seconds. Words enter after space.</p>
          <button onClick={startGame}>Start</button>
        </div>
      )}

      {game.started && !game.over && (
        <div className="typing-game">
          <p className="typing-timer">{game.timeLeft}</p>

          <div className="typing-words" ref={wordsRef}>
            {game.words.map((word, i) => {
              let className = "typing-word";
              if (i === game.currentIndex) className += " current";
              else if (i < game.currentIndex) {
                className += game.results[i]?.correct
                  ? " correct"
                  : " incorrect";
              }
              return (
                <span key={i} className={className}>
                  {word}
                </span>
              );
            })}
          </div>

          <input
            type="text"
            ref={inputRef}
            className="typing-input"
            value={input}
            onChange={handleInput}
            autoFocus
          />
        </div>
      )}

      {game.over && (
        <div className="game-over">
          <h2>GAME OVER</h2>
          <div className="typing-stats">
            <p>
              <strong>{calcWPM(game.results)}</strong> WPM
            </p>
            <p>
              <strong>{accuracyCalc(game.results)}%</strong> Accuracy
            </p>
            <p>
              <strong>Score: {calcScore(game.results)}</strong>
            </p>
            <p>
              {game.results.filter((r) => r.correct).length} /{" "}
              {game.results.length} words correct
            </p>
          </div>
          {!token && <p>Log in to save your scores!</p>}
          {error && <p role="alert">{error}</p>}
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </>
  );
}
