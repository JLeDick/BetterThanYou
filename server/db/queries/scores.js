import db from "#db/client";

export async function createScore({ userId, gameId, score }) {
  const {
    rows: [newScore],
  } = await db.query(
    `
    INSERT INTO scores (user_id, game_id, score)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [userId, gameId, score]
  );
  return newScore;
}

export async function getScoresByGame({ gameId }) {
  const { rows } = await db.query(
    `
    SELECT * FROM scores
    WHERE game_id = $1
    `,
    [gameId]
  );
  return rows;
}

export async function getScoresByUser({ userId }) {
  const { rows } = await db.query(
    `
    SELECT * FROM scores
    WHERE user_id = $1
    `,
    [userId]
  );
  return rows;
}

export async function getTopScoreByGameAndUser({ userId, gameId }) {
  const {
    rows: [topScore],
  } = await db.query(
    `
    SELECT score FROM scores
    WHERE user_id = $1
    AND game_id = $2
    ORDER BY score DESC LIMIT 1
    `,
    [userId, gameId]
  );
  return topScore;
}

export async function getScoresByGameAndUser({ userId, gameId }) {
  const { rows } = await db.query(
    `
    SELECT score FROM scores
    WHERE user_id = $1
    AND game_id = $2
    `,
    [userId, gameId]
  );
  return rows;
}

export async function getMaxScoresByGame({ gameId }) {
  const { rows } = await db.query(
    `
    SELECT users.username, MAX(scores.score) AS "topScore"
    FROM scores
    JOIN users ON scores.user_id = users.id
    WHERE scores.game_id = $1
    GROUP BY users.id, users.username
    ORDER BY "topScore" DESC
    `,
    [gameId]
  );
  return rows;
}

export async function getTopScoresByUser({ userId }) {
  const { rows } = await db.query(
    `
    SELECT games.id AS "gameId", games.name, MAX(scores.score) AS "topScore"
    FROM scores
    JOIN games ON scores.game_id = games.id
    WHERE scores.user_id = $1
    GROUP BY games.id, games.name
    ORDER BY games.id
    `,
    [userId]
  );
  return rows;
}

export async function getDailyTopScores({ userId }) {
  const { rows } = await db.query(
    `
    SELECT games.id AS "gameId", games.name, MAX(scores.score) AS "topScore"
    FROM scores
    JOIN games ON scores.game_id = games.id
    WHERE scores.user_id = $1
    AND scores.created_at > NOW() - INTERVAL '1 day'
    GROUP BY games.id, games.name
    ORDER BY games.id
    `,
    [userId]
  );
  return rows;
}

export async function getWeeklyTopScores({ userId }) {
  const { rows } = await db.query(
    `
    SELECT games.id AS "gameId", games.name, MAX(scores.score) AS "topScore"
    FROM scores
    JOIN games ON scores.game_id = games.id
    WHERE scores.user_id = $1
    AND scores.created_at > NOW() - INTERVAL '7 days'
    GROUP BY games.id, games.name
    ORDER BY games.id
    `,
    [userId]
  );
  return rows;
}

export async function getMonthlyTopScores({ userId }) {
  const { rows } = await db.query(
    `
    SELECT games.id AS "gameId", games.name, MAX(scores.score) AS "topScore"
    FROM scores
    JOIN games ON scores.game_id = games.id
    WHERE scores.user_id = $1
    AND scores.created_at > NOW() - INTERVAL '30 days'
    GROUP BY games.id, games.name
    ORDER BY games.id
    `,
    [userId]
  );
  return rows;
}
