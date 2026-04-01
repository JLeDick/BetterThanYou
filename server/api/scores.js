import express from "express";
import { createScore, getTopScoresByUser } from "#db/queries/scores";
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

router.get("/compare", async (req, res) => {
  const users = req.query.users;
  if (!users) return res.status(400).send("Missing users query parameter");

  const [username1, username2] = users.split(",");
  if (!username1 || !username2) {
    return res.status(400).send("Provide two comma-separated usernames");
  }

  const user1 = await getUserByUsername({ username: username1 });
  const user2 = await getUserByUsername({ username: username2 });

  if (!user1 || !user2) {
    return res.status(404).send("User not found");
  }

  const user1Scores = await getTopScoresByUser({ userId: user1.id });
  const user2Scores = await getTopScoresByUser({ userId: user2.id });
  res.send({ user1: user1Scores, user2: user2Scores });
});

export default router;
