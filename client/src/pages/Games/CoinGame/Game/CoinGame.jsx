import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { AuthContext, HOST } from "../../../../context/AuthContext";
import {
  COIN_RADIUS,
  TABLE_CENTER,
  MAX_POWER,
  step,
  isMoving,
} from "../Logic/physics";
import { spawnCoinsAndCups } from "../Logic/spawn";
import { render } from "../Logic/renderer";

const CANVAS_SIZE = 600;
const MAX_DRAG = 300;

export default function CoinGame() {
  const { token } = useContext(AuthContext);
  const canvasRef = useRef(null);
  const phaseRef = useRef("idle");
  const gameRef = useRef(null);

  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  // UPDATE BOTH THE REF AND REACT STATE SO THE GAME LOOP ALWAYS
  // READS THE LATEST PHASE AND REACT RE-RENDERS FOR UI CHANGES
  const setGamePhase = useCallback((p) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const startGame = () => {
    const { coins, cups } = spawnCoinsAndCups(8, 1);
    gameRef.current = {
      coins,
      cups,
      lives: 3,
      score: 0,
      round: 1,
      roundScore: 0,
      shooterId: null,
      touchedCoins: new Set(),
      fallenThisShot: [],
      isDragging: false,
      dragStart: null,
      arrow: null,
    };
    setError(null);
    setGamePhase("picking");
  };

  // GAME LOOP + SHOT RESOLUTION
  const isActive = phase !== "idle" && phase !== "gameOver";

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let running = true;

    // RESOLVE THE SHOT ONCE ALL COINS STOP
    const resolveShot = () => {
      const g = gameRef.current;
      const fallen = g.fallenThisShot;

      // ALL COINS DISTURBED THIS TURN, MINUS THE SHOOTER = "HIT COINS"
      const hitCoins = new Set(g.touchedCoins);
      hitCoins.delete(g.shooterId);

      let livesLost = fallen.length; // EACH FALLEN COIN COSTS 1 LIFE
      let success = false;
      let nextShooterId = null;

      if (hitCoins.size === 1 && fallen.length === 0) {
        // CLEAN HIT — EXACTLY 1 OTHER COIN DISTURBED, NOTHING FELL
        success = true;
        nextShooterId = [...hitCoins][0];
        const shooter = g.coins.find((c) => c.id === g.shooterId);
        if (shooter) {
          shooter.active = false;
          shooter.isShooter = false;
        }
        g.score += 1;
        g.roundScore += 1;
        g.notification = {
          text: "Nice! +1",
          color: "#2ecc71",
          time: Date.now(),
        };
      } else if (hitCoins.size === 0 && fallen.length === 0) {
        livesLost += 1; // PURE WHIFF
        g.notification = {
          text: "Miss! -1 Life",
          color: "#e04040",
          time: Date.now(),
        };
      } else if (hitCoins.size >= 2) {
        livesLost += 1; // MULTI-HIT: MORE THAN 1 COIN DISTURBED
        g.notification = {
          text: "Multi-hit! -1 Life",
          color: "#e04040",
          time: Date.now(),
        };
      } else if (fallen.length > 0) {
        g.notification = {
          text: `Fell off! -${fallen.length} Life`,
          color: "#e04040",
          time: Date.now(),
        };
      }

      g.lives -= livesLost;
      if (g.lives <= 0) {
        g.lives = 0;
        setFinalScore({ score: g.score, round: g.round });
        setGamePhase("gameOver");
        return;
      }

      const remaining = g.coins.filter((c) => c.active);

      // ROUND CLEAR CHECK
      if (success && remaining.length <= 1) {
        g.score += g.roundScore; // DOUBLE POINTS FOR THE ROUND
        g.round += 1;
        g.notification = {
          text: `Round Clear! 2x bonus! Score: ${g.score}`,
          color: "#c9a84c",
          time: Date.now(),
        };
        const { coins, cups } = spawnCoinsAndCups(8, g.round);
        g.coins = coins;
        g.cups = cups;
        g.roundScore = 0;
        g.shooterId = null;
        setGamePhase("picking");
        return;
      }

      // NOT ENOUGH COINS TO CONTINUE
      if (remaining.length < 2 && livesLost < 2) {
        g.round += 1;
        g.notification = {
          text: `Round Clear! Failed Last Turn, No Bonus: ${g.score}`,
          color: "#c9a74c",
          time: Date.now(),
        };
        const { coins, cups } = spawnCoinsAndCups(8, g.round);
        g.coins = coins;
        g.cups = cups;
        g.roundScore = 0;
        g.shooterId = null;
        setGamePhase("picking");
        return;
      } else if (remaining.length === 0 && livesLost > 0) {
        g.round += 1;
        g.notification = {
          text: `Round Clear! Failed Last Turn, No Bonus: ${g.score}`,
          color: "#c9a74c",
          time: Date.now(),
        };
        const { coins, cups } = spawnCoinsAndCups(8, g.round);
        g.coins = coins;
        g.cups = cups;
        g.roundScore = 0;
        g.shooterId = null;
        setGamePhase("picking");
        return;
      }

      // SET UP NEXT TURN
      if (success && nextShooterId !== null) {
        const next = g.coins.find((c) => c.id === nextShooterId && c.active);
        if (next) {
          g.coins.forEach((c) => (c.isShooter = false));
          next.isShooter = true;
          g.shooterId = next.id;
          setGamePhase("aiming");
        } else {
          g.shooterId = null;
          g.coins.forEach((c) => (c.isShooter = false));
          setGamePhase("picking");
        }
      } else {
        g.shooterId = null;
        g.coins.forEach((c) => (c.isShooter = false));
        setGamePhase("picking");
      }

      g.touchedCoins = new Set();
      g.fallenThisShot = [];
    };

    const loop = () => {
      if (!running) return;
      const g = gameRef.current;
      if (!g) return;

      // RUN PHYSICS WHEN SIMULATING
      if (phaseRef.current === "simulating") {
        const { collisions, fallen } = step(g.coins, g.cups);

        // TRACK ALL COINS INVOLVED IN ANY COLLISION
        for (const [a, b] of collisions) {
          g.touchedCoins.add(a);
          g.touchedCoins.add(b);
        }
        g.fallenThisShot.push(...fallen);

        if (!isMoving(g.coins)) {
          resolveShot();
        }
      }

      // DETERMINE PHASE MESSAGE
      let message = null;
      if (phaseRef.current === "picking") message = "Click a coin to select";
      else if (phaseRef.current === "aiming" && !g.isDragging)
        message = "Drag from your coin to aim";

      // RENDER
      render(ctx, {
        coins: g.coins,
        cups: g.cups,
        arrow: g.arrow,
        lives: g.lives,
        score: g.score,
        round: g.round,
        phase: phaseRef.current,
        message,
        notification: g.notification,
      });

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => {
      running = false;
    };
  }, [isActive, setGamePhase]);

  // INPUT HANDLING
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      const touch = e.touches?.[0] || e.changedTouches?.[0];
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const findCoinAt = (pos) => {
      const g = gameRef.current;
      if (!g) return null;
      return g.coins.find((c) => {
        if (!c.active) return false;
        const dx = pos.x - c.x;
        const dy = pos.y - c.y;
        return Math.sqrt(dx * dx + dy * dy) < COIN_RADIUS + 6;
      });
    };

    const handleDown = (e) => {
      e.preventDefault();
      const g = gameRef.current;
      const p = phaseRef.current;
      if (!g || (p !== "picking" && p !== "aiming")) return;

      const pos = getPos(e);
      const clicked = findCoinAt(pos);
      if (!clicked) return;

      if (p === "picking") {
        g.coins.forEach((c) => (c.isShooter = false));
        clicked.isShooter = true;
        g.shooterId = clicked.id;
        phaseRef.current = "aiming";
        setPhase("aiming");
      }

      if (clicked.id === g.shooterId) {
        g.isDragging = true;
        g.dragStart = pos;
      }
    };

    const handleMove = (e) => {
      e.preventDefault();
      const g = gameRef.current;
      if (!g || !g.isDragging) return;

      const pos = getPos(e);
      const shooter = g.coins.find((c) => c.id === g.shooterId);
      if (!shooter) return;

      // ARROW POINTS OPPOSITE TO DRAG DIRECTION
      const dx = g.dragStart.x - pos.x;
      const dy = g.dragStart.y - pos.y;
      const dragDist = Math.sqrt(dx * dx + dy * dy);
      const power = Math.min(dragDist / MAX_DRAG, 1);
      const angle = Math.atan2(dy, dx);
      const arrowLen = power * 320;

      g.arrow = {
        startX: shooter.x,
        startY: shooter.y,
        endX: shooter.x + arrowLen * Math.cos(angle),
        endY: shooter.y + arrowLen * Math.sin(angle),
        power,
        angle,
      };
    };

    const handleUp = (e) => {
      e.preventDefault();
      const g = gameRef.current;
      if (!g || !g.isDragging) return;

      g.isDragging = false;
      const arrowData = g.arrow;
      g.arrow = null;

      if (!arrowData || arrowData.power < 0.06) return; // TOO WEAK

      const shooter = g.coins.find((c) => c.id === g.shooterId);
      if (!shooter) return;

      const speed = arrowData.power * MAX_POWER;
      shooter.vx = speed * Math.cos(arrowData.angle);
      shooter.vy = speed * Math.sin(arrowData.angle);

      g.touchedCoins = new Set();
      g.fallenThisShot = [];

      phaseRef.current = "simulating";
      setPhase("simulating");
    };

    // CANVAS GETS MOUSEDOWN/TOUCHSTART; WINDOW GETS MOVE/UP
    // SO DRAGGING WORKS EVEN IF CURSOR LEAVES THE CANVAS
    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("touchstart", handleDown, { passive: false });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    return () => {
      canvas.removeEventListener("mousedown", handleDown);
      canvas.removeEventListener("touchstart", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isActive]);

  // SUBMITS SCORE AFTER GAME
  useEffect(() => {
    if (phase !== "gameOver" || !token || !gameRef.current) return;
    const score = gameRef.current.score;
    if (score <= 0) return;

    fetch(`${HOST}api/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ game_id: 3, score }),
    }).catch((e) => setError(e.message));
  }, [phase, token]);

  // GAME RENDER
  return (
    <>
      <header>
        <h1>Coin Game</h1>
      </header>

      {phase === "idle" && (
        <div className="game-start">
          <p>Flick coins across the table. Hit one at a time.</p>
          <button onClick={startGame}>Start</button>
        </div>
      )}

      {isActive && (
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="coin-game-canvas"
        />
      )}

      {phase === "gameOver" && (
        <div className="game-over">
          <h2>GAME OVER</h2>
          <div className="typing-stats">
            <p>
              <strong>Score: {finalScore?.score}</strong>
            </p>
            <p>Round reached: {finalScore?.round}</p>
          </div>
          {!token && <p>Log in to save your scores!</p>}
          {error && <p role="alert">{error}</p>}
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </>
  );
}
