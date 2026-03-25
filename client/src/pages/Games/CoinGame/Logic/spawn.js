import { COIN_RADIUS, CUP_RADIUS, TABLE_CENTER, TABLE_RADIUS } from "./physics";

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// RANDOM POINT INSIDE THE TABLE, WITH PADDING FROM THE EDGE
function randomInTable(objectRadius, padding = 30) {
  const maxR = TABLE_RADIUS - objectRadius - padding;
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * maxR; // SQRT FOR UNIFORM DISTRIBUTION IN CIRCLE
  return {
    x: TABLE_CENTER.x + r * Math.cos(angle),
    y: TABLE_CENTER.y + r * Math.sin(angle),
  };
}

export function spawnCoinsAndCups(numCoins = 8, numCups = 1) {
  const placed = []; // ALL PLACED OBJECTS FOR OVERLAP CHECKING
  const coins = [];
  const cups = [];

  // PLACE CUPS FIRST (BIGGER, HARDER TO FIT)
  for (let i = 0; i < numCups; i++) {
    let pos;
    let attempts = 0;
    do {
      pos = randomInTable(CUP_RADIUS);
      attempts++;
    } while (
      attempts < 200 &&
      placed.some((o) => distance(pos, o) < o.radius + CUP_RADIUS + 10)
    );

    const cup = { x: pos.x, y: pos.y, radius: CUP_RADIUS };
    placed.push(cup);
    cups.push(cup);
  }

  // PLACE COINS
  for (let i = 0; i < numCoins; i++) {
    let pos;
    let attempts = 0;
    do {
      pos = randomInTable(COIN_RADIUS);
      attempts++;
    } while (
      attempts < 200 &&
      placed.some((o) => distance(pos, o) < o.radius + COIN_RADIUS + 8)
    );

    const coin = {
      id: i,
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      radius: COIN_RADIUS,
      active: true,
      isShooter: false,
    };
    placed.push(coin);
    coins.push(coin);
  }

  return { coins, cups };
}
