export function generateColors(round) {
  // Creates random base color
  // added do/while to make sure no grays show up
  let r, g, b;
  do {
    r = Math.floor(Math.random() * 200) + 28;
    g = Math.floor(Math.random() * 200) + 28;
    b = Math.floor(Math.random() * 200) + 28;
  } while (Math.max(r, g, b) - Math.min(r, g, b) < 40);

  const baseAvg = (r + g + b) / 3;

  // Similarity: starts at 50%, hits 80% at round 50, halves remaining gap every 25 rounds
  const blend = 1 - 0.5 * Math.pow(0.5, round / 25);

  // Offset color high if baseAvg low, low if baseAvg high
  let anchor = 0;
  if (baseAvg < 127.5) {
    anchor = 255;
  } else {
    anchor = 0;
  }

  const oddR = Math.round(anchor + (r - anchor) * blend);
  const oddG = Math.round(anchor + (g - anchor) * blend);
  const oddB = Math.round(anchor + (b - anchor) * blend);

  // Sets the array
  const oddIndex = Math.floor(Math.random() * 6);

  const base = `rgb(${r}, ${g}, ${b})`;
  const odd = `rgb(${oddR}, ${oddG}, ${oddB})`;
  const colors = Array(6).fill(base);
  colors[oddIndex] = odd;

  return { colors, oddIndex };
}
