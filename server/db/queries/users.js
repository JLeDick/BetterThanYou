import db from "#db/client";
import bcrypt from "bcrypt";

export async function getUsers() {
  const { rows } = await db.query(`SELECT * FROM users`);
  return rows;
}

export async function registerUser({ username, email, password_hash }) {
  const {
    rows: [registeredUser],
  } = await db.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, email, password_hash]
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
  } = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return user;
}
