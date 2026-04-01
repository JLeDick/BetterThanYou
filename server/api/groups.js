import express from "express";
import {
  createGroup,
  getGroupByInviteCode,
  joinGroup,
  getGroupsByUser,
  getGroupDetails,
  getGroupLeaderboard,
  leaveGroup,
  isMember,
} from "#db/queries/groups";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

const router = express.Router();

// Create a new group
router.post(
  "/",
  requireUser,
  requireBody(["name"]),
  async (req, res) => {
    const group = await createGroup({
      name: req.body.name,
      created_by: req.user.id,
    });
    res.status(201).send(group);
  }
);

// Join a group via invite code
router.post(
  "/join",
  requireUser,
  requireBody(["invite_code"]),
  async (req, res) => {
    const group = await getGroupByInviteCode({
      invite_code: req.body.invite_code,
    });
    if (!group) return res.status(404).send("Invalid invite code");

    const member = await joinGroup({
      group_id: group.id,
      user_id: req.user.id,
    });

    if (!member) return res.status(409).send("Already a member");
    res.send(group);
  }
);

// List groups the current user belongs to
router.get("/mine", requireUser, async (req, res) => {
  const groups = await getGroupsByUser({ user_id: req.user.id });
  res.send(groups);
});

// Get group details + leaderboard
router.get("/:id", requireUser, async (req, res) => {
  const group_id = parseInt(req.params.id);
  const member = await isMember({ group_id, user_id: req.user.id });
  if (!member) return res.status(403).send("Not a member of this group");

  const [details, leaderboard] = await Promise.all([
    getGroupDetails({ group_id }),
    getGroupLeaderboard({ group_id }),
  ]);

  res.send({ ...details, leaderboard });
});

// Leave a group
router.delete("/:id/leave", requireUser, async (req, res) => {
  const group_id = parseInt(req.params.id);
  await leaveGroup({ group_id, user_id: req.user.id });
  res.send("Left group");
});

export default router;
