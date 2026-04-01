import { useState, useEffect } from "react";
import { HOST } from "../../context/AuthContext.js";

export default function Leaderboard() {
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  // run once on initial mount to populate games
  useEffect(() => {
    const fetchGames = async () => {
      const response = await fetch(`${HOST}api/games`, {
        method: "GET",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const data = await response.json();
      setGames(data);
    };

    fetchGames();
  }, []);

  // Click game => fetchScores => setScores && renders on each game change
  useEffect(() => {
    if (!selectedGame) {
      setScores([]);
      return;
    }

    const fetchScores = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${HOST}api/scores/game/${selectedGame}`, {
          method: "GET",
        });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message);
        }
        setScores(await response.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
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
