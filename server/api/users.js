import express from "express";
import {
  getUserByUsernameAndPassword,
  getUserByUsername,
  getUsers,
  registerUser,
} from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

// User registration
router.post(
  "/register",
  requireBody(["username", "email", "password_hash"]),
  async (req, res) => {
    const user = await registerUser(req.body);
    res.status(201).send(user);
  }
);

// User login
router.post(
  "/login",
  requireBody(["username", "password_hash"]),
  async (req, res) => {
    const { username, password_hash } = req.body;
    const user = await getUserByUsernameAndPassword({
      username,
      password_hash,
    });
    if (!user) return res.status(401).send("Invalid username or password");
    const token = await createToken({ id: user.id });
    res.send(token);
  }
);

export default router;
