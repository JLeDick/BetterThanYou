export default function calcWPM(results) {
  const correctChars = results
    .filter((r) => r.correct)
    .reduce((sum, r) => sum + r.word.length + 1, 0);
  return Math.round(correctChars / 5 / 0.5);
}
