import { useState } from "react";
import { HOST } from "../../context/AuthContext.js";

export default function Compare() {
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [usernames, setUsernames] = useState({ user1: "", user2: "" });

  const tryCompare = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const user1 = formData.get("username1");
    const user2 = formData.get("username2");
    setUsernames({ user1, user2 });
    try {
      const response = await fetch(
        `${HOST}api/scores/compare/${user1}/${user2}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      setResults(await response.json());
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <header>
        <h1>Compare Users</h1>
      </header>

      <div className="user-compare-block">
        <form onSubmit={tryCompare}>
          <label>
            User 1
            <input type="text" name="username1" required />
          </label>
          <label>
            User 2
            <input type="text" name="username2" required />
          </label>
          <button>Compare</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>

      {results && (
        <div className="compare-results">
          <div className="user1-results">
            <h2>{usernames.user1}</h2>
            {results.user1.map((game) => {
              const opponent = results.user2.find(
                (g) => g.game_id === game.game_id
              );
              const diff = game.top_score - (opponent ? opponent.top_score : 0);
              return (
                <div
                  key={game.game_id}
                  className={`game-score ${diff >= 0 ? "winning" : "losing"}`}
                >
                  <h3>{game.name}</h3>
                  <p>Top: {game.top_score}</p>
                  <p>{diff >= 0 ? `+${diff}` : diff}</p>
                </div>
              );
            })}
          </div>

          <div className="user2-results">
            <h2>{usernames.user2}</h2>
            {results.user2.map((game) => {
              const opponent = results.user1.find(
                (g) => g.game_id === game.game_id
              );
              const diff = game.top_score - (opponent ? opponent.top_score : 0);
              return (
                <div
                  key={game.game_id}
                  className={`game-score ${diff >= 0 ? "winning" : "losing"}`}
                >
                  <h3>{game.name}</h3>
                  <p>Top: {game.top_score}</p>
                  <p>{diff >= 0 ? `+${diff}` : diff}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
