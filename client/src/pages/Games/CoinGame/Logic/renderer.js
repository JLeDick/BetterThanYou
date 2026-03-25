import { COIN_RADIUS, CUP_RADIUS, TABLE_CENTER, TABLE_RADIUS } from "./physics";

export function render(ctx, state) {
  const { coins, cups, arrow, lives, score, round, message, notification } =
    state;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // BACKGROUND
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, W, H);

  // TABLE — OUTER GLOW
  ctx.beginPath();
  ctx.arc(TABLE_CENTER.x, TABLE_CENTER.y, TABLE_RADIUS + 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(194, 42, 42, 0.15)";
  ctx.lineWidth = 10;
  ctx.stroke();

  // TABLE — SURFACE
  const tableGrad = ctx.createRadialGradient(
    TABLE_CENTER.x,
    TABLE_CENTER.y,
    0,
    TABLE_CENTER.x,
    TABLE_CENTER.y,
    TABLE_RADIUS
  );
  tableGrad.addColorStop(0, "#1c1c1c");
  tableGrad.addColorStop(0.85, "#151515");
  tableGrad.addColorStop(1, "#111");
  ctx.beginPath();
  ctx.arc(TABLE_CENTER.x, TABLE_CENTER.y, TABLE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = tableGrad;
  ctx.fill();

  // TABLE — EDGE RING
  ctx.beginPath();
  ctx.arc(TABLE_CENTER.x, TABLE_CENTER.y, TABLE_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = "#c22a2a";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // CUPS
  for (const cup of cups) {
    // SHADOW
    ctx.beginPath();
    ctx.arc(cup.x + 2, cup.y + 2, CUP_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    // BODY
    const cupGrad = ctx.createRadialGradient(
      cup.x - 4,
      cup.y - 4,
      3,
      cup.x,
      cup.y,
      CUP_RADIUS
    );
    cupGrad.addColorStop(0, "#2a2a2a");
    cupGrad.addColorStop(1, "#0e0e0e");
    ctx.beginPath();
    ctx.arc(cup.x, cup.y, CUP_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = cupGrad;
    ctx.fill();
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // COINS
  for (const coin of coins) {
    if (!coin.active) continue;

    // SHADOW
    ctx.beginPath();
    ctx.arc(coin.x + 2, coin.y + 2, COIN_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fill();

    if (coin.isShooter) {
      // SHOOTER — GOLD GLOW
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, COIN_RADIUS + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201, 168, 76, 0.3)";
      ctx.lineWidth = 5;
      ctx.stroke();

      // SHOOTER — GOLD GRADIENT
      const goldGrad = ctx.createRadialGradient(
        coin.x - 3,
        coin.y - 3,
        2,
        coin.x,
        coin.y,
        COIN_RADIUS
      );
      goldGrad.addColorStop(0, "#edd88a");
      goldGrad.addColorStop(1, "#b08828");
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = goldGrad;
      ctx.fill();
      ctx.strokeStyle = "#d4a843";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // REGULAR COIN — SILVER GRADIENT
      const coinGrad = ctx.createRadialGradient(
        coin.x - 3,
        coin.y - 3,
        2,
        coin.x,
        coin.y,
        COIN_RADIUS
      );
      coinGrad.addColorStop(0, "#f0f0f0");
      coinGrad.addColorStop(1, "#b8b8b8");
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = coinGrad;
      ctx.fill();
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // AIMING ARROW
  if (arrow) {
    const { startX, startY, endX, endY, power } = arrow;

    // ARROW LINE
    const alpha = 0.4 + power * 0.6;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(194, 42, 42, ${alpha})`;
    ctx.lineWidth = 2.5 + power * 1.5;
    ctx.stroke();

    // ARROWHEAD
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLen = 8 + power * 4;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLen * Math.cos(angle - 0.4),
      endY - headLen * Math.sin(angle - 0.4)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLen * Math.cos(angle + 0.4),
      endY - headLen * Math.sin(angle + 0.4)
    );
    ctx.strokeStyle = `rgba(194, 42, 42, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // HUD
  ctx.font = "bold 14px system-ui, sans-serif";

  // LIVES (LEFT)
  ctx.textAlign = "left";
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText(`Lives: ${lives}`, 16, 24);

  // ROUND (CENTER)
  ctx.textAlign = "center";
  ctx.fillStyle = "#c9a84c";
  ctx.fillText(`Round ${round}`, W / 2, 24);

  // SCORE (RIGHT)
  ctx.textAlign = "right";
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText(`Score: ${score}`, W - 16, 24);

  // SHOT RESULT NOTIFICATION (CENTER OF TABLE, FADES AFTER 1.5S)
  if (notification && Date.now() - notification.time < 1500) {
    const age = Date.now() - notification.time;
    const alpha = Math.max(0, 1 - age / 1500);
    ctx.textAlign = "center";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = notification.color
      .replace(")", `, ${alpha})`)
      .replace("rgb", "rgba");
    // SIMPLER: JUST USE GLOBALALPHA
    ctx.globalAlpha = alpha;
    ctx.fillStyle = notification.color;
    ctx.fillText(notification.text, TABLE_CENTER.x, TABLE_CENTER.y);
    ctx.globalAlpha = 1;
  }

  // PHASE MESSAGE (BOTTOM CENTER)
  if (message) {
    ctx.textAlign = "center";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillStyle = "#8a8a8a";
    ctx.fillText(message, W / 2, H - 16);
  }
}
