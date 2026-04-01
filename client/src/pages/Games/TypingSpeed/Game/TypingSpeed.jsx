import { useState, useEffect, use, useRef } from "react";
import { AuthContext, HOST } from "../../../../context/AuthContext";
import calcWPM from "../Logic/wordsPerMinute";
import accuracyCalc from "../Logic/accuracyCalc";
import getRandomWords from "../Logic/wordSelection";
import calcScore from "../Logic/calcScore";

export default function TypingSpeed() {
  const { token } = use(AuthContext);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const wordsRef = useRef(null);

  const [game, setGame] = useState({
    started: false,
    over: false,
    words: [],
    currentIndex: 0,
    results: [],
    timeLeft: 30,
  });

  const [input, setInput] = useState("");

  const startGame = () => {
    setError(null);
    setInput("");
    setGame({
      started: true,
      over: false,
      words: getRandomWords(),
      currentIndex: 0,
      results: [],
      timeLeft: 30,
    });
  };

  // Timer
  useEffect(() => {
    if (!game.started || game.over) return;

    const interval = setInterval(() => {
      setGame((prev) => {
        if (prev.timeLeft <= 1) {
          return { ...prev, over: true, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game.started, game.over]);

  // Submit score when game ends
  useEffect(() => {
    if (!game.over || !token) return;
    const score = calcScore(game.results);
    if (score <= 0) return;

    fetch(`${HOST}api/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ game_id: 2, score: score }),
    }).catch((e) => setError(e.message));
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

      {!game.started && !game.over && (
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
