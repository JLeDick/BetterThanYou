import "dotenv/config";

import express from "express";
import cors from "cors";
import getUserFromToken from "#middleware/getUserFromToken";
import usersRouter from "#api/users";
import scoresRouter from "#api/scores";
import gamesRouter from "#api/games";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(getUserFromToken);

app.use("/api/users", usersRouter);
app.use("/api/scores", scoresRouter);
app.use("/api/games", gamesRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
