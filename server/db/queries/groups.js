import db from "#db/client";
import crypto from "crypto";

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex");
}

export async function createGroup({ name, createdBy }) {
  const inviteCode = generateInviteCode();
  const {
    rows: [group],
  } = await db.query(
    `INSERT INTO groups (name, invite_code, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, invite_code AS "inviteCode", created_by AS "createdBy", created_at AS "createdAt"`,
    [name, inviteCode, createdBy]
  );

  await db.query(
    `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
    [group.id, createdBy]
  );

  return group;
}

export async function getGroupByInviteCode({ inviteCode }) {
  const {
    rows: [group],
  } = await db.query(
    `SELECT id, name, invite_code AS "inviteCode" FROM groups WHERE invite_code = $1`,
    [inviteCode]
  );
  return group;
}

export async function joinGroup({ groupId, userId }) {
  const {
    rows: [member],
  } = await db.query(
    `INSERT INTO group_members (group_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [groupId, userId]
  );
  return member;
}

export async function getGroupsByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT g.id, g.name, g.invite_code AS "inviteCode", g.created_at AS "createdAt"
     FROM groups g
     JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = $1
     ORDER BY g.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getGroupDetails({ groupId }) {
  const {
    rows: [group],
  } = await db.query(
    `SELECT id, name, invite_code AS "inviteCode" FROM groups WHERE id = $1`,
    [groupId]
  );

  const { rows: members } = await db.query(
    `SELECT u.id, u.username, gm.joined_at AS "joinedAt"
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = $1
     ORDER BY gm.joined_at`,
    [groupId]
  );

  return { group, members };
}

export async function getGroupLeaderboard({ groupId }) {
  const { rows } = await db.query(
    `SELECT g.id AS "gameId", g.name AS "gameName", u.username,
            MAX(s.score) AS "topScore"
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     JOIN scores s ON s.user_id = u.id
     JOIN games g ON s.game_id = g.id
     WHERE gm.group_id = $1
     GROUP BY g.id, g.name, u.id, u.username
     ORDER BY g.id, "topScore" DESC`,
    [groupId]
  );
  return rows;
}

export async function leaveGroup({ groupId, userId }) {
  await db.query(
    `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
}

export async function isMember({ groupId, userId }) {
  const {
    rows: [row],
  } = await db.query(
    `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return !!row;
}
