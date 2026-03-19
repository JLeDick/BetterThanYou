import express from "express";
import {
  submitScore,
  getScoresByGame,
  getScoresByUser,
  getTopScoreByGameAndUser,
  getScoresByGameAndUser,
  getMaxScoresByGame,
  getAllTopScoresOfUser,
} from "#db/queries/scores";
import { getUserByUsername } from "#db/queries/users";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

const router = express.Router();

router.post(
  "/",
  requireUser,
  requireBody(["game_id", "score"]),
  async (req, res) => {
    const score = await submitScore({
      user_id: req.user.id,
      game_id: req.body.game_id,
      score: req.body.score,
    });
    res.status(201).send(score);
  }
);

// For Leaderboard
router.get("/game/:game_id", async (req, res) => {
  const scores = await getMaxScoresByGame({ game_id: req.params.game_id });
  res.send(scores);
});

// All scores for a users stat page
router.get("/user/:user_id", async (req, res) => {
  const scores = await getScoresByUser({ user_id: req.params.user_id });
  res.send(scores);
});

// Users scores on a specific game
router.get("/game/:game_id/user", requireUser, async (req, res) => {
  const scores = await getScoresByGameAndUser({
    user_id: req.user.id,
    game_id: req.params.game_id,
  });
  res.send(scores);
});

// Compare two users top scores across all games
router.get("/compare/:username1/:username2", async (req, res) => {
  const user1 = await getUserByUsername({ username: req.params.username1 });
  const user2 = await getUserByUsername({ username: req.params.username2 });

  if (!user1 || !user2) {
    return res.status(404).send("User not found");
  }

  const user1Scores = await getAllTopScoresOfUser({ user_id: user1.id });
  const user2Scores = await getAllTopScoresOfUser({ user_id: user2.id });
  res.send({ user1: user1Scores, user2: user2Scores });
});

export default router;
