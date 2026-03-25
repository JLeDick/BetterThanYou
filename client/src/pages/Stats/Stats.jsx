import { useEffect, useState, useContext } from "react";
import { AuthContext, HOST } from "../../context/AuthContext";

export default function Stats() {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`${HOST}api/scores/stats/${user.id}`);

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message);
        }

        const data = await response.json();
        setStats(data);
      } catch (e) {
        setError(e.message);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return <p>Log in to see your stats.</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <>
      <header>
        <h1>{user.username}'s Stats</h1>
      </header>

      {error && <p role="alert">{error}</p>}

      <div className="stats-sections">
        <StatsSection title="Daily Best" scores={stats.daily} />
        <StatsSection title="Weekly Best" scores={stats.weekly} />
        <StatsSection title="Monthly Best" scores={stats.monthly} />
        <StatsSection title="All Time Best" scores={stats.allTime} />
      </div>
    </>
  );
}

function StatsSection({ title, scores }) {
  return (
    <div className="stats-section">
      <h3>{title}</h3>
      {scores.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        <div className="stats-games">
          {/* Had to change `scores.map((s) =>` to
          `[]...scores].sort((a, b) => a.game_id - b.game_id).map to get
          the games to appear in the correct order */}
          {[...scores]
            .sort((a, b) => a.game_id - b.game_id)
            .map((s) => (
              <div key={s.game_id} className="stats-game-card">
                <p className="stats-game-name">{s.name}</p>
                <p className="stats-game-score">{s.top_score}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
