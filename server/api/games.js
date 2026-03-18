import express from "express";
import { getGames } from "#db/queries/games";

const router = express.Router();

router.get("/", async (req, res) => {
  const games = await getGames();
  res.send(games);
});

export default router;
