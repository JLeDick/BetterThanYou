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

router.post(
  "/",
  requireUser,
  requireBody(["name"]),
  async (req, res) => {
    const group = await createGroup({
      name: req.body.name,
      createdBy: req.user.id,
    });
    res.status(201).send(group);
  }
);

router.post(
  "/join",
  requireUser,
  requireBody(["inviteCode"]),
  async (req, res) => {
    const group = await getGroupByInviteCode({
      inviteCode: req.body.inviteCode,
    });
    if (!group) return res.status(404).send("Invalid invite code");

    const member = await joinGroup({
      groupId: group.id,
      userId: req.user.id,
    });

    if (!member) return res.status(409).send("Already a member");
    res.send(group);
  }
);

router.get("/mine", requireUser, async (req, res) => {
  const groups = await getGroupsByUser({ userId: req.user.id });
  res.send(groups);
});

router.get("/:id", requireUser, async (req, res) => {
  const groupId = parseInt(req.params.id);
  const member = await isMember({ groupId, userId: req.user.id });
  if (!member) return res.status(403).send("Not a member of this group");

  const [details, leaderboard] = await Promise.all([
    getGroupDetails({ groupId }),
    getGroupLeaderboard({ groupId }),
  ]);

  res.send({ ...details, leaderboard });
});

router.delete("/:id/leave", requireUser, async (req, res) => {
  const groupId = parseInt(req.params.id);
  await leaveGroup({ groupId, userId: req.user.id });
  res.send("Left group");
});

export default router;
