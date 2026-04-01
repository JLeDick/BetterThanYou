import { useActionState } from "react";
import { compareUsers } from "../../api/queries.js";

export default function Compare() {
  const [state, submitAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const user1 = formData.get("username1");
      const user2 = formData.get("username2");
      try {
        const results = await compareUsers(user1, user2);
        return { results, usernames: { user1, user2 }, error: null };
      } catch (e) {
        return { results: null, usernames: null, error: e.message };
      }
    },
    { results: null, usernames: null, error: null }
  );

  const { results, usernames, error } = state;

  return (
    <>
      <header>
        <h1>Compare Users</h1>
      </header>

      <div className="user-compare-block">
        <form action={submitAction}>
          <label>
            User 1
            <input type="text" name="username1" required />
          </label>
          <label>
            User 2
            <input type="text" name="username2" required />
          </label>
          <button disabled={isPending}>
            {isPending ? "Comparing..." : "Compare"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>

      {results && (
        <div className="compare-results">
          <div className="user1-results">
            <h2>{usernames.user1}</h2>
            {results.user1.map((game) => {
              const opponent = results.user2.find(
                (g) => g.gameId === game.gameId
              );
              const diff = game.topScore - (opponent ? opponent.topScore : 0);
              return (
                <div
                  key={game.gameId}
                  className={`game-score ${diff >= 0 ? "winning" : "losing"}`}
                >
                  <h3>{game.name}</h3>
                  <p>Top: {game.topScore}</p>
                  <p>{diff >= 0 ? `+${diff}` : diff}</p>
                </div>
              );
            })}
          </div>

          <div className="user2-results">
            <h2>{usernames.user2}</h2>
            {results.user2.map((game) => {
              const opponent = results.user1.find(
                (g) => g.gameId === game.gameId
              );
              const diff = game.topScore - (opponent ? opponent.topScore : 0);
              return (
                <div
                  key={game.gameId}
                  className={`game-score ${diff >= 0 ? "winning" : "losing"}`}
                >
                  <h3>{game.name}</h3>
                  <p>Top: {game.topScore}</p>
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
