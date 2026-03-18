import db from "#db/client";
import bcrypt from "bcrypt";

export async function getUsers() {
  try {
    const { rows } = await db.query(
      `
      SELECT * FROM users;
      `
    );
    return rows;
  } catch (e) {
    console.log("Could not fetch users", e);
  }
}

export async function registerUser({ username, email, password_hash }) {
  try {
    const {
      rows: [registeredUser],
    } = await db.query(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [username, email, password_hash]
    );
    return registeredUser;
  } catch (e) {
    console.log("Could not register user", e);
  }
}
export async function getUserByUsername({ username }) {
  try {
    const {
      rows: [user],
    } = await db.query(
      `
      SELECT * FROM users
      WHERE username = $1
      `,
      [username]
    );
    return user;
  } catch (e) {
    console.log("Unable to fetch user data", e);
  }
}

export async function getUserByUsernameAndPassword({
  username,
  password_hash,
}) {
  try {
    const {
      rows: [user],
    } = await db.query(
      `
      SELECT * FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (!user) return null;

    const isValid = await bcrypt.compare(password_hash, user.password_hash);
    if (!isValid) return null;

    return user;
  } catch (e) {
    console.log("Unable to fetch user data", e);
  }
}

export async function getUserById({ id }) {
  try {
    const {
      rows: [user],
    } = await db.query(
      `
      SELECT * FROM users
      WHERE id = $1
      `,
      [id]
    );
    return user;
  } catch (e) {
    console.log("Couldn't fetch user by ID", e);
  }
}
