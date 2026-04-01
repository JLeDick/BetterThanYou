import db from "#db/client";
import bcrypt from "bcrypt";

export async function getUsers() {
  const { rows } = await db.query(`SELECT * FROM users`);
  return rows;
}

export async function registerUser({ username, email, password_hash }) {
  const hashedPassword = await bcrypt.hash(password_hash, 10);
  const {
    rows: [registeredUser],
  } = await db.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, email, hashedPassword]
  );
  return registeredUser;
}

export async function getUserByUsername({ username }) {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
  return user;
}

export async function getUserByUsernameAndPassword({
  username,
  password_hash,
}) {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);

  if (!user) return null;

  const isValid = await bcrypt.compare(password_hash, user.password_hash);
  if (!isValid) return null;

  return user;
}

export async function getUserById({ id }) {
  const {
    rows: [user],
  } = await db.query(
    `SELECT id, username, email, email_verified FROM users WHERE id = $1`,
    [id]
  );
  return user;
}

export async function getUserByEmail({ email }) {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return user;
}

export async function setVerificationToken({ user_id, token, expires }) {
  await db.query(
    `UPDATE users
     SET verification_token = $1, verification_token_expires = $2
     WHERE id = $3`,
    [token, expires, user_id]
  );
}

export async function verifyUserEmail({ token }) {
  const {
    rows: [user],
  } = await db.query(
    `UPDATE users
     SET email_verified = true, verification_token = NULL, verification_token_expires = NULL
     WHERE verification_token = $1
       AND verification_token_expires > NOW()
     RETURNING id, username, email`,
    [token]
  );
  return user;
}

export async function setResetToken({ user_id, token, expires }) {
  await db.query(
    `UPDATE users
     SET reset_token = $1, reset_token_expires = $2
     WHERE id = $3`,
    [token, expires, user_id]
  );
}

export async function getUserByResetToken({ token }) {
  const {
    rows: [user],
  } = await db.query(
    `SELECT id, username, email FROM users
     WHERE reset_token = $1
       AND reset_token_expires > NOW()`,
    [token]
  );
  return user;
}

export async function changePassword({ user_id, current_password, new_password }) {
  const {
    rows: [user],
  } = await db.query(`SELECT password_hash FROM users WHERE id = $1`, [user_id]);
  if (!user) return { error: "User not found." };

  const isValid = await bcrypt.compare(current_password, user.password_hash);
  if (!isValid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(new_password, 10);
  await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hashed, user_id]);
  return { error: null };
}

export async function updatePassword({ user_id, password_hash }) {
  await db.query(
    `UPDATE users
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [password_hash, user_id]
  );
}
