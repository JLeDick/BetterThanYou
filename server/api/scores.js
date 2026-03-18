import express from "express";
import {
  submitScore,
  getScoresByGame,
  getScoresByUser,
  getTopScoreByGameAndUser,
  getScoresByGameAndUser,
  getMaxScoresByGame,
} from "#db/queries/scores";
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

export default router;
