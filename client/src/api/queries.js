import { HOST } from "../context/AuthContext.js";

// --- Users ---

export async function resendVerification(token) {
  const res = await fetch(`${HOST}api/users/resend-verification`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function verifyEmail(verificationToken) {
  const res = await fetch(`${HOST}api/users/verify/${verificationToken}`);
  const message = await res.text();
  return { ok: res.ok, message };
}

export async function forgotPassword(email) {
  const res = await fetch(`${HOST}api/users/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.text();
}

export async function resetPassword({ token, password }) {
  const res = await fetch(`${HOST}api/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const message = await res.text();
  if (!res.ok) throw new Error(message);
  return message;
}

export async function changePassword({ token, currentPassword, newPassword }) {
  const res = await fetch(`${HOST}api/users/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const message = await res.text();
  if (!res.ok) throw new Error(message);
  return message;
}

// --- Scores ---

export async function createScore({ token, gameId, score }) {
  const res = await fetch(`${HOST}api/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameId, score }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getUserStats(userId) {
  const res = await fetch(`${HOST}api/users/${userId}/stats`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getGameScores(gameId) {
  const res = await fetch(`${HOST}api/games/${gameId}/scores`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function compareUsers(username1, username2) {
  const res = await fetch(
    `${HOST}api/scores/compare/${username1}/${username2}`
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// --- Games ---

export async function getGames() {
  const res = await fetch(`${HOST}api/games`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// --- Groups ---

export async function getMyGroups(token) {
  const res = await fetch(`${HOST}api/groups/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getGroupDetails({ token, groupId }) {
  const res = await fetch(`${HOST}api/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function createGroup({ token, name }) {
  const res = await fetch(`${HOST}api/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function joinGroup({ token, inviteCode }) {
  const res = await fetch(`${HOST}api/groups/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ inviteCode }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function leaveGroup({ token, groupId }) {
  const res = await fetch(`${HOST}api/groups/${groupId}/leave`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}
