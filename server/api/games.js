import express from "express";
import { getGames } from "#db/queries/games";
import {
  getMaxScoresByGame,
  getScoresByGameAndUser,
} from "#db/queries/scores";
import requireUser from "#middleware/requireUser";

const router = express.Router();

router.get("/", async (req, res) => {
  const games = await getGames();
  res.send(games);
});

router.get("/:gameId/scores", async (req, res) => {
  const scores = await getMaxScoresByGame({ gameId: req.params.gameId });
  res.send(scores);
});

router.get("/:gameId/scores/me", requireUser, async (req, res) => {
  const scores = await getScoresByGameAndUser({
    userId: req.user.id,
    gameId: req.params.gameId,
  });
  res.send(scores);
});

export default router;
