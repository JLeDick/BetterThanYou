import "dotenv/config";

import express from "express";
import cors from "cors";
import getUserFromToken from "#middleware/getUserFromToken";
import usersRouter from "#api/users";
import scoresRouter from "#api/scores";
import gamesRouter from "#api/games";
import groupsRouter from "#api/groups";

const app = express();
const PORT = process.env.PORT ?? 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(getUserFromToken);

app.use("/api/users", usersRouter);
app.use("/api/scores", scoresRouter);
app.use("/api/games", gamesRouter);
app.use("/api/groups", groupsRouter);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send(err.message || "Internal server error");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
