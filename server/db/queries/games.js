import db from "#db/client";

export async function getGames() {
  const { rows } = await db.query(`SELECT * FROM games`);
  return rows;
}
