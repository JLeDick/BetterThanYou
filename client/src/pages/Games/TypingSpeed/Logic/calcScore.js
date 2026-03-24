import calcWPM from "./wordsPerMinute";
import accuracyCalc from "./accuracyCalc";

export default function calcScore(results) {
  const wpm = calcWPM(results);
  const accuracy = accuracyCalc(results);
  return Math.round(wpm * Math.pow(accuracy / 100, 2));
}
