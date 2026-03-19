import db from "#db/client";

export async function submitScore({ user_id, game_id, score }) {
  const {
    rows: [newScore],
  } = await db.query(
    `
    INSERT INTO scores (user_id, game_id, score)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [user_id, game_id, score]
  );
  return newScore;
}

export async function getScoresByGame({ game_id }) {
  const { rows } = await db.query(
    `
    SELECT * FROM scores
    WHERE game_id = $1
    `,
    [game_id]
  );
  return rows;
}

export async function getScoresByUser({ user_id }) {
  const { rows } = await db.query(
    `
    SELECT * FROM scores
    WHERE user_id = $1
    `,
    [user_id]
  );
  return rows;
}

export async function getTopScoreByGameAndUser({ user_id, game_id }) {
  const {
    rows: [topScore],
  } = await db.query(
    `
    SELECT score FROM scores
    WHERE user_id = $1
    AND game_id = $2
    ORDER BY score DESC LIMIT 1
    `,
    [user_id, game_id]
  );
  return topScore;
}

export async function getScoresByGameAndUser({ user_id, game_id }) {
  const { rows } = await db.query(
    `
    SELECT score FROM scores
    WHERE user_id = $1
    AND game_id = $2
    `,
    [user_id, game_id]
  );
  return rows;
}

export async function getMaxScoresByGame({ game_id }) {
  const { rows } = await db.query(
    `
    SELECT users.username, MAX(scores.score) AS top_score
    FROM scores
    JOIN users ON scores.user_id = users.id
    WHERE scores.game_id = $1
    GROUP BY users.id, users.username
    ORDER BY top_score DESC
    `,
    [game_id]
  );
  return rows;
}

export async function getAllTopScoresOfUser({ user_id }) {
  const { rows } = await db.query(
    `
    SELECT games.id AS game_id, games.name, MAX(scores.score) AS top_score
    FROM scores
    JOIN games ON scores.game_id = games.id
    WHERE scores.user_id = $1
    GROUP BY games.id, games.name
    `,
    [user_id]
  );
  return rows;
}
