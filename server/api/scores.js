import express from "express";
import {
  createScore,
  getScoresByGame,
  getScoresByUser,
  getTopScoreByGameAndUser,
  getScoresByGameAndUser,
  getMaxScoresByGame,
  getTopScoresByUser,
  getDailyTopScores,
  getWeeklyTopScores,
  getMonthlyTopScores,
} from "#db/queries/scores";
import { getUserByUsername } from "#db/queries/users";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

const router = express.Router();

router.post(
  "/",
  requireUser,
  requireBody(["gameId", "score"]),
  async (req, res) => {
    const score = await createScore({
      userId: req.user.id,
      gameId: req.body.gameId,
      score: req.body.score,
    });
    res.status(201).send(score);
  }
);

router.get("/game/:gameId", async (req, res) => {
  const scores = await getMaxScoresByGame({ gameId: req.params.gameId });
  res.send(scores);
});

router.get("/user/:userId", async (req, res) => {
  const scores = await getScoresByUser({ userId: req.params.userId });
  res.send(scores);
});

router.get("/game/:gameId/user", requireUser, async (req, res) => {
  const scores = await getScoresByGameAndUser({
    userId: req.user.id,
    gameId: req.params.gameId,
  });
  res.send(scores);
});

router.get("/compare/:username1/:username2", async (req, res) => {
  const user1 = await getUserByUsername({ username: req.params.username1 });
  const user2 = await getUserByUsername({ username: req.params.username2 });

  if (!user1 || !user2) {
    return res.status(404).send("User not found");
  }

  const user1Scores = await getTopScoresByUser({ userId: user1.id });
  const user2Scores = await getTopScoresByUser({ userId: user2.id });
  res.send({ user1: user1Scores, user2: user2Scores });
});

router.get("/stats/:userId", async (req, res) => {
  const userId = req.params.userId;
  const [allTime, daily, weekly, monthly] = await Promise.all([
    getTopScoresByUser({ userId }),
    getDailyTopScores({ userId }),
    getWeeklyTopScores({ userId }),
    getMonthlyTopScores({ userId }),
  ]);
  res.send({ allTime, daily, weekly, monthly });
});

export default router;
