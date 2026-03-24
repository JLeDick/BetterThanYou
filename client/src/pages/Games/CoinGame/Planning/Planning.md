# Coin Game - Design Document

## Overview

A physics-based coin flicking game inspired by the izakaya minigame in Ghost of Yotei. The player flicks coins on a circular table, trying to hit targets while avoiding obstacles. Built with HTML5 Canvas.

---

## Table Setup

- The playing field is a **circular table** rendered on a Canvas element
- **8 coins** are randomly placed on the table at the start of each round
- **N cups** (obstacles) are randomly placed on the table
  - Round 1 starts with **1 cup**
  - Each cleared round adds **+1 cup**
  - Cups reset to **1** on game over / new game
- Coins and cups must not overlap each other on spawn
- All objects are circles (makes collision math simple)

### Visual Design

- **Coins:** Yellow circles with a dark outline (target coins and shooter coin look the same)
- **Cups:** Black circles, slightly larger than coins
- **Table:** White/cream circle with a dark border
- **Active shooter coin:** Highlighted (glow, outline, or subtle pulse) so the player knows which coin they're flicking

---

## Controls

Putt-putt golf flash game style:

1. **Click** on the active coin (or any coin on the first turn / after a miss)
2. **Hold and drag** away from the coin — an arrow appears pointing in the **opposite direction** of the mouse (the direction the coin will travel)
3. The **further you drag**, the longer the arrow, the harder the shot
4. **Release** the mouse button to flick the coin

### Arrow Indicator

- Appears on mousedown on a valid coin
- Points from the coin in the opposite direction of the mouse cursor
- Length scales with drag distance (capped at a maximum power)
- Color or thickness could indicate power level (optional polish)

### Mobile Controls

- Same mechanic using touch events (touchstart, touchmove, touchend)
- Touch on the coin, drag away, release to flick

---

## Turn Flow

### First Turn of a Round (or after a miss/fall-off)

1. Player clicks any coin on the table to select it as the shooter
2. Player flicks that coin using click-drag-release

### Subsequent Turns

1. The coin that was **hit** on the previous turn automatically becomes the new shooter
2. Player flicks it using click-drag-release (no selection step)

---

## Physics

### Movement

- Each coin has an `x`, `y` position and `vx`, `vy` velocity
- Each frame (requestAnimationFrame loop):
  - Move coin: `x += vx`, `y += vy`
  - Apply friction: `vx *= friction`, `vy *= friction` (friction ~0.98)
  - When velocity is near zero (e.g., `Math.abs(vx) + Math.abs(vy) < 0.1`), snap to zero and stop
- All coins move simultaneously — a flicked coin can hit a coin that then hits another coin in the same shot

### Collision Detection (Circle vs Circle)

Two circles collide when:

```
distance(center1, center2) < radius1 + radius2
```

Where distance is:

```
Math.sqrt((x2 - x1)^2 + (y2 - y1)^2)
```

### Collision Response (Elastic Collision)

When two coins collide, swap velocity components along the collision axis:

1. Calculate the normal vector between centers: `nx = (x2-x1)/dist`, `ny = (y2-y1)/dist`
2. Calculate relative velocity along normal: `dvn = (vx1-vx2)*nx + (vy1-vy2)*ny`
3. If `dvn > 0` (moving toward each other), apply impulse:
   - `vx1 -= dvn * nx`, `vy1 -= dvn * ny`
   - `vx2 += dvn * nx`, `vy2 += dvn * ny`

This assumes equal mass for all coins. Cups are treated as **infinite mass** (immovable) — the coin bounces off, the cup doesn't move.

### Coin vs Cup Collision

Same detection as coin-coin, but only the coin's velocity changes (reflect off the cup surface):

1. Calculate normal vector from cup center to coin center
2. Reflect the coin's velocity: `v = v - 2 * (v dot n) * n`
3. Cup stays in place

### Table Boundary (Coin Falls Off)

The table is a circle with center `(cx, cy)` and radius `R`. A coin falls off when:

```
distance(coin_center, table_center) + coin_radius > table_radius
```

When a coin crosses the boundary:
- Remove it from the table permanently
- Deduct 1 life
- Play a falling-off animation (optional: coin shrinks/fades as it falls)

### Shot Resolution

A shot is "resolved" when ALL coins on the table have velocity zero (everything has stopped moving). Only then does the game evaluate the outcome and advance the turn.

---

## Scoring & Game State

### Lives

- Player starts with **3 lives**
- Lives persist across rounds (clearing a round does NOT restore lives)
- Losing all 3 lives = game over

### Point System

- **+1 point** per successful hit (shooter disappears, target becomes next shooter)
- **Round clear bonus:** Clearing all 7 target coins = **double points for that round** (so 7 hits = 14 points instead of 7)
- Points carry across rounds

### What Counts as a Miss

| Scenario | Lives Lost | Coins Removed | Next Turn |
|---|---|---|---|
| Hit exactly 1 coin, nothing falls off | 0 (success!) | Shooter disappears | Hit coin = new shooter |
| Hit 0 coins (whiff) | 1 | None | Pick any coin |
| Hit 2+ coins, nothing falls off | 1 | None | Pick any coin |
| 1 coin falls off table | 1 per fallen coin | Fallen coins gone | Pick any coin (if shooter fell) or continue |
| 2 coins fall off table | 2 | Both gone | Pick any coin |
| Multi-hit + coins fall off | 1 (for multi-hit) + 1 per fallen coin | Fallen coins gone | Pick any coin |

### Important Edge Cases

- **Shooter coin falls off:** Player lost their shooter. They pick a new coin from whatever remains. -1 life.
- **Target coin falls off:** That coin is gone permanently. -1 life. It does NOT count as a successful "hit" — you don't get a point.
- **Both shooter and target fall off:** -2 lives. Pick from remaining coins.
- **Cup knocks a coin off:** If a coin bounces off a cup and then off the table, that still costs a life. The cup caused it, but it's still a fall-off.
- **Chain reaction:** Shooter hits coin A, coin A hits coin B. This is a multi-hit (shooter contacted 1 coin, but 2 coins were disturbed). Actually — does this count as multi-hit? **Clarification needed.** Suggested rule: multi-hit only counts direct contacts by the shooter coin. Chain reactions from target coins hitting other coins are fine — only the coin the SHOOTER directly touches counts for the "hit exactly 1" rule.
- **All coins fall off or only 1 remains with no lives:** Game over.
- **Coin lands exactly on edge:** Treat as fallen off (simpler).

---

## Round Progression

1. **Round 1:** 8 coins, 1 cup
2. Player clears all 7 target coins (1 coin remains — the last one hit)
3. Points for that round are doubled
4. **Round 2:** 8 new coins, 2 cups. Score carries over. Lives carry over.
5. **Round 3:** 8 coins, 3 cups. And so on.

The game continues until the player loses all 3 lives. The final score is submitted.

---

## Technical Implementation Plan

### File Structure

```
CoinGame/
  Planning/
    Planning.md          <-- this file
  Game/
    CoinGame.jsx         <-- main React component (canvas + game state)
  Logic/
    physics.js           <-- movement, friction, collision detection & response
    gameState.js         <-- turn resolution, scoring, round management
    spawn.js             <-- random placement of coins/cups without overlap
    controls.js          <-- click-drag-release input handling
    renderer.js          <-- canvas drawing (table, coins, cups, arrow, UI)
    calcScore.js         <-- final score calculation for submission
```

### Tech Approach

- **HTML5 Canvas** for rendering (no DOM elements for game objects)
- **requestAnimationFrame** for the game loop
- React only manages the outer shell (start button, game over screen, score display)
- All game logic and rendering runs in plain JS on the canvas
- useRef for canvas element, useEffect for game loop setup/teardown

### Game Loop (each frame)

1. Update physics (move coins, apply friction)
2. Check collisions (coin-coin, coin-cup)
3. Check boundary (any coin off table?)
4. Check if all coins stopped → resolve turn
5. Render everything (table, cups, coins, arrow, UI overlay)

### Score Submission

- game_id: 3 (needs to be added to the games table in the database)
- Score = total points accumulated across all rounds
- Submitted on game over via POST /api/scores (same pattern as Color Game and Typing Test)

---

## Database

Add a new game entry:

```sql
INSERT INTO games (name) VALUES ('Coin Game');
```

This should get game_id 3 (assuming Color Game = 1, Typing Test = 2).

---

## UI Layout

### Pre-Game Screen

- Game title: "Coin Game"
- Brief rules explanation
- Start button

### In-Game HUD

- **Lives:** Displayed as icons or "Lives: 3" (top corner)
- **Score:** Current total points (top corner)
- **Round:** Current round number (top corner)
- **Coins remaining:** How many targets left this round

### Game Over Screen

- "GAME OVER"
- Final score
- Round reached
- Play again button
- If not logged in: "Log in to save your scores!"

---

## Open Questions

1. **Chain reactions:** If shooter hits coin A, and coin A then bumps coin B — is that a multi-hit? Suggested: NO. Only direct shooter contacts count. Chain reactions are just physics happening.
2. **Can cups fall off the table?** Suggested: NO. Cups are fixed/immovable obstacles.
3. **Minimum drag distance:** Should there be a minimum power threshold so you can't just tap-flick with zero force?
4. **Coin placement on first pick:** Should the player just click a coin to select it, then drag to flick in one motion? Or click to select, then click-drag to flick as two separate actions?
5. **Sound effects:** Coin clink on hit, thud on cup bounce, whoosh on fall-off? (stretch goal)
