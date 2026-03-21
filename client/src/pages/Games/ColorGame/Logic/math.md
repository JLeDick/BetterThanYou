# Color Game Blend Algorithms

All formulas use: `oddChannel = anchor + (channel - anchor) * blend` where anchor = 128.

---

## Version 1 — Start 80%, halve every 20 rounds

```js
const blend = 1 - 0.2 * Math.pow(0.5, round / 20);
```

| Round | Blend   |
| ----- | ------- |
| 1     | 80.7%   |
| 10    | 85.9%   |
| 20    | 90%     |
| 40    | 95%     |
| 60    | 97.5%   |
| 80    | 98.75%  |
| 100   | 99.375% |

---

## Version 2 — Start 50%, halve every 20 rounds

```js
const blend = 1 - 0.5 * Math.pow(0.5, round / 20);
```

| Round | Blend   |
| ----- | ------- |
| 1     | 51.7%   |
| 10    | 64.6%   |
| 20    | 75%     |
| 40    | 87.5%   |
| 60    | 93.75%  |
| 80    | 96.875% |
| 100   | 98.4%   |

---

## Version 3 (current) — Start 50%, hit 80% at round 50

```js
const blend = 1 - 0.5 * Math.pow(0.5, round / 38);
```

| Round | Blend |
| ----- | ----- |
| 1     | 50.9% |
| 10    | 58.3% |
| 20    | 65.2% |
| 30    | 71.1% |
| 40    | 76.1% |
| 50    | 80%   |
| 60    | 83.4% |
| 70    | 86.2% |
| 80    | 88.5% |
| 90    | 90.5% |
| 100   | 92%   |

Alright, my last main issue seems to be when all the colors land near-gray. Something like (130, 125, 128). When that happens, since I'm pulling my offset color towards gray, this can create an impossible tile at any round no matter the "round difficulty". I have a few ways I can think of changing this;

1. Reject gray. I can create some sort of conditional where, if the colors are all too similar, I can reroll, so to speak.

2. Dynamic anchor - instead of anchoring to 128, I can pick an anchor that's further away from the base color. If the base aberages near 128 the anchor shifts to 0 or 255. The off block always has somehwere meaningful to be pulled towards (this feels like the most natural option right off the bat)

3. Minimum channel variance - When generating the color, I could force on channel high and one low. Like generate the first channel freely, then ensureat least one other channel is 60+ units away from it. It guarntees colorful bases without rejection.

4. Opposite anchor - set `anchor = baseAvg > 128 ? 0 : 255`. I think this one is the best since, instead of being "washed out" or "towards gray", it can look more visually interesting.

Alright I did number 4 with;

```js
const baseAvg = (r + g + b) / 3;

let anchor = 0;
if (baseAvg < 127.5) {
  anchor = 255;
} else {
  anchor = 0;
}
```

But it didn't really do much insofar as the grays go. I think I have to reject gray altogether...

I have to wrap it in a loop, check the value and give it a pass or a fail. If it's too close to gray, it'll fail and I'll re rerun the loop until it doesn't fail.

```js
let r, g, b;
do {
  r = Math.floor(Math.random() * 200) + 28;
  g = Math.floor(Math.random() * 200) + 28;
  b = Math.floor(Math.random() * 200) + 28;
} while (Math.max(r, g, b) - Math.min(r, g, b) < 40);
```

Alright this should make it so I can't hit anything in the gray-zone
