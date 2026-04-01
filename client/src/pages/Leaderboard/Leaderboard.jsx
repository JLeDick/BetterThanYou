import { useState, useEffect } from "react";
import { getGames, getGameScores } from "../../api/queries.js";

export default function Leaderboard() {
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGames().then((data) => setGames(data));
  }, []);

  useEffect(() => {
    if (!selectedGame) {
      setScores([]);
      return;
    }

    setLoading(true);
    setError(null);

    getGameScores(selectedGame)
      .then((data) => setScores(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGame]);

  return (
    <>
      <header>
        <h1>Leaderboard</h1>
      </header>

      <div className="leaderboard-select">
        <label>
          Game
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="">Select a Game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading...</p>}
      {scores.length > 0 && (
        <div className="leaderboard">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, i) => (
                <tr
                  key={entry.username}
                  className={i < 3 ? `top-${i + 1}` : ""}
                >
                  <td>{i + 1}</td>
                  <td>{entry.username}</td>
                  <td>{Number(entry.topScore).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && selectedGame && scores.length === 0 && !error && (
        <p>No scores yet for this game.</p>
      )}
    </>
  );
}
