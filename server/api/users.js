import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  getUserByUsernameAndPassword,
  getUserByEmail,
  registerUser,
  setVerificationToken,
  verifyUserEmail,
  setResetToken,
  getUserByResetToken,
  updatePassword,
  changePassword,
} from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createToken } from "#utils/jwt";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "#utils/email";

const router = express.Router();

router.get("/me", requireUser, (req, res) => {
  res.send(req.user);
});

router.post(
  "/register",
  requireBody(["username", "email", "password"]),
  async (req, res) => {
    const user = await registerUser(req.body);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await setVerificationToken({
      userId: user.id,
      token: verificationToken,
      expires,
    });

    try {
      await sendVerificationEmail({
        email: user.email,
        token: verificationToken,
      });
    } catch (e) {
      console.error("Failed to send verification email:", e);
    }

    const token = await createToken({ id: user.id });
    res.status(201).send(token);
  }
);

router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsernameAndPassword({
      username,
      password,
    });
    if (!user) return res.status(401).send("Invalid username or password");
    const token = await createToken({ id: user.id });
    res.send(token);
  }
);

router.get("/verify/:token", async (req, res) => {
  const user = await verifyUserEmail({ token: req.params.token });
  if (!user) {
    return res.status(400).send("Invalid or expired verification link.");
  }
  res.send("Email verified successfully!");
});

router.post("/resend-verification", requireUser, async (req, res) => {
  if (req.user.emailVerified) {
    return res.status(400).send("Email already verified.");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await setVerificationToken({
    userId: req.user.id,
    token: verificationToken,
    expires,
  });

  try {
    await sendVerificationEmail({
      email: req.user.email,
      token: verificationToken,
    });
    res.send("Verification email sent.");
  } catch (e) {
    console.error("Failed to send verification email:", e);
    res.status(500).send("Failed to send email. Try again later.");
  }
});

router.post(
  "/forgot-password",
  requireBody(["email"]),
  async (req, res) => {
    const user = await getUserByEmail({ email: req.body.email });

    if (!user) {
      return res.send("If that email exists, a reset link has been sent.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await setResetToken({ userId: user.id, token: resetToken, expires });

    try {
      await sendPasswordResetEmail({ email: user.email, token: resetToken });
    } catch (e) {
      console.error("Failed to send reset email:", e);
    }

    res.send("If that email exists, a reset link has been sent.");
  }
);

router.post(
  "/reset-password",
  requireBody(["token", "password"]),
  async (req, res) => {
    const user = await getUserByResetToken({ token: req.body.token });
    if (!user) {
      return res.status(400).send("Invalid or expired reset link.");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await updatePassword({ userId: user.id, passwordHash: hashedPassword });

    res.send("Password updated successfully.");
  }
);

router.post(
  "/change-password",
  requireUser,
  requireBody(["currentPassword", "newPassword"]),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { error } = await changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });
    if (error) return res.status(400).send(error);
    res.send("Password changed successfully.");
  }
);

export default router;
