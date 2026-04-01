import { useEffect, useState, use } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getUserStats } from "../../api/queries.js";

export default function Stats() {
  const { user } = use(AuthContext);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    getUserStats(user.id)
      .then((data) => setStats(data))
      .catch((e) => setError(e.message));
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
          {scores.map((s) => (
              <div key={s.gameId} className="stats-game-card">
                <p className="stats-game-name">{s.name}</p>
                <p className="stats-game-score">{s.topScore}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
