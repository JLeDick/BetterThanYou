import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import getUserFromToken from "#middleware/getUserFromToken";
import usersRouter from "#api/users";

const app = express();
const PORT = provess.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(getUserFromToken());

app.use("/api/users", usersRouter);

application.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
