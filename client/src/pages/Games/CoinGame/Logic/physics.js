// PHYSICS CONSTANTS
export const COIN_RADIUS = 14;
export const CUP_RADIUS = 20;
export const TABLE_RADIUS = 260;
export const TABLE_CENTER = { x: 300, y: 300 };
export const FRICTION = 0.985;
export const MIN_VELOCITY = 0.1;
export const MAX_POWER = 14;

// RETURNS TRUE IF ANY ACTIVE COIN IS STILL MOVING
export function isMoving(coins) {
  return coins.some(
    (c) =>
      c.active &&
      (Math.abs(c.vx) > MIN_VELOCITY || Math.abs(c.vy) > MIN_VELOCITY)
  );
}

// RUN ONE PHYSICS FRAME. RETURNS { COLLISIONS: [[IDA, IDB]], FALLEN: [ID] }
export function step(coins, cups) {
  const collisions = [];
  const fallen = [];

  // MOVE COINS AND APPLY FRICTION
  for (const c of coins) {
    if (!c.active) continue;
    c.x += c.vx;
    c.y += c.vy;
    c.vx *= FRICTION;
    c.vy *= FRICTION;

    if (Math.abs(c.vx) < MIN_VELOCITY && Math.abs(c.vy) < MIN_VELOCITY) {
      c.vx = 0;
      c.vy = 0;
    }
  }

  // COIN-COIN ELASTIC COLLISIONS (EQUAL MASS)
  for (let i = 0; i < coins.length; i++) {
    if (!coins[i].active) continue;
    for (let j = i + 1; j < coins.length; j++) {
      if (!coins[j].active) continue;

      const a = coins[i];
      const b = coins[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = COIN_RADIUS * 2;

      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;

        if (dvn > 0) {
          a.vx -= dvn * nx;
          a.vy -= dvn * ny;
          b.vx += dvn * nx;
          b.vy += dvn * ny;
          collisions.push([a.id, b.id]);
        }

        // SEPARATE OVERLAPPING COINS
        const overlap = minDist - dist;
        a.x -= (overlap / 2) * nx;
        a.y -= (overlap / 2) * ny;
        b.x += (overlap / 2) * nx;
        b.y += (overlap / 2) * ny;
      }
    }
  }

  // COIN-CUP COLLISIONS (CUPS ARE IMMOVABLE)
  for (const coin of coins) {
    if (!coin.active) continue;
    for (const cup of cups) {
      const dx = coin.x - cup.x;
      const dy = coin.y - cup.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = COIN_RADIUS + CUP_RADIUS;

      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const dot = coin.vx * nx + coin.vy * ny;

        if (dot < 0) {
          coin.vx -= 2 * dot * nx * 0.7;
          coin.vy -= 2 * dot * ny * 0.7;
        }

        const overlap = minDist - dist;
        coin.x += overlap * nx;
        coin.y += overlap * ny;
      }
    }
  }

  // TABLE BOUNDARY — COIN FALLS OFF WHEN ITS EDGE CROSSES THE TABLE EDGE
  for (const coin of coins) {
    if (!coin.active) continue;
    const dx = coin.x - TABLE_CENTER.x;
    const dy = coin.y - TABLE_CENTER.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist + COIN_RADIUS > TABLE_RADIUS) {
      coin.active = false;
      fallen.push(coin.id);
    }
  }

  return { collisions, fallen };
}
