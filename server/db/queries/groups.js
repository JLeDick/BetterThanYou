import db from "#db/client";
import crypto from "crypto";

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex"); // 8-char hex string
}

export async function createGroup({ name, created_by }) {
  const invite_code = generateInviteCode();
  const {
    rows: [group],
  } = await db.query(
    `INSERT INTO groups (name, invite_code, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, invite_code, created_by]
  );

  // Creator auto-joins the group
  await db.query(
    `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
    [group.id, created_by]
  );

  return group;
}

export async function getGroupByInviteCode({ invite_code }) {
  const {
    rows: [group],
  } = await db.query(`SELECT * FROM groups WHERE invite_code = $1`, [
    invite_code,
  ]);
  return group;
}

export async function joinGroup({ group_id, user_id }) {
  const {
    rows: [member],
  } = await db.query(
    `INSERT INTO group_members (group_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [group_id, user_id]
  );
  return member;
}

export async function getGroupsByUser({ user_id }) {
  const { rows } = await db.query(
    `SELECT g.id, g.name, g.invite_code, g.created_at
     FROM groups g
     JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = $1
     ORDER BY g.created_at DESC`,
    [user_id]
  );
  return rows;
}

export async function getGroupDetails({ group_id }) {
  const {
    rows: [group],
  } = await db.query(`SELECT * FROM groups WHERE id = $1`, [group_id]);

  const { rows: members } = await db.query(
    `SELECT u.id, u.username, gm.joined_at
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = $1
     ORDER BY gm.joined_at`,
    [group_id]
  );

  return { group, members };
}

export async function getGroupLeaderboard({ group_id }) {
  const { rows } = await db.query(
    `SELECT g.id AS game_id, g.name AS game_name, u.username,
            MAX(s.score) AS top_score
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     JOIN scores s ON s.user_id = u.id
     JOIN games g ON s.game_id = g.id
     WHERE gm.group_id = $1
     GROUP BY g.id, g.name, u.id, u.username
     ORDER BY g.id, top_score DESC`,
    [group_id]
  );
  return rows;
}

export async function leaveGroup({ group_id, user_id }) {
  await db.query(
    `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [group_id, user_id]
  );
}

export async function isMember({ group_id, user_id }) {
  const {
    rows: [row],
  } = await db.query(
    `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [group_id, user_id]
  );
  return !!row;
}
