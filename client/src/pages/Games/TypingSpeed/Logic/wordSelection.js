import { top500Words } from "../Words/staticWordList";

export default function getRandomWords(count = 100) {
  const shuffled = [...top500Words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
