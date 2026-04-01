import { useState, useEffect, useActionState, use } from "react";
import { AuthContext, HOST } from "../../context/AuthContext";

export default function Group() {
  const { token, user } = use(AuthContext);
  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [groupDetail, setGroupDetail] = useState(null);

  // Fetch user's groups on mount
  useEffect(() => {
    if (!token) return;
    fetchGroups();
  }, [token]);

  // Fetch group details when one is selected
  useEffect(() => {
    if (!selectedId) {
      setGroupDetail(null);
      return;
    }
    fetch(`${HOST}api/groups/${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setGroupDetail(data))
      .catch(() => {
        setSelectedId(null);
        setGroupDetail(null);
      });
  }, [selectedId]);

  const fetchGroups = () => {
    fetch(`${HOST}api/groups/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setGroups(data))
      .catch(() => {});
  };

  const handleLeave = async (groupId) => {
    await fetch(`${HOST}api/groups/${groupId}/leave`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelectedId(null);
    fetchGroups();
  };

  if (!token) return <p>Log in to see your groups.</p>;

  return (
    <>
      <header>
        <h1>Groups</h1>
      </header>

      <div className="groups-forms">
        <CreateGroupForm token={token} onCreated={fetchGroups} />
        <JoinGroupForm token={token} onJoined={fetchGroups} />
      </div>

      {groups.length > 0 && (
        <div className="groups-list">
          <h3>My Groups</h3>
          {groups.map((g) => (
            <div
              key={g.id}
              className={`group-card${selectedId === g.id ? " active" : ""}`}
              onClick={() => setSelectedId(g.id)}
            >
              <span className="group-name">{g.name}</span>
              <span className="group-code">Code: {g.inviteCode}</span>
            </div>
          ))}
        </div>
      )}

      {groupDetail && (
        <GroupDetail
          data={groupDetail}
          onLeave={handleLeave}
          currentUser={user}
        />
      )}
    </>
  );
}

function CreateGroupForm({ token, onCreated }) {
  const [state, submitAction, isPending] = useActionState(
    async (_prev, formData) => {
      const name = formData.get("name");
      try {
        const res = await fetch(`${HOST}api/groups`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error(await res.text());
        const group = await res.json();
        onCreated();
        return { error: null, created: group };
      } catch (e) {
        return { error: e.message, created: null };
      }
    },
    { error: null, created: null }
  );

  return (
    <div className="group-form-box">
      <h3>Create Group</h3>
      <form action={submitAction}>
        <label>
          Group Name
          <input type="text" name="name" required />
        </label>
        <button disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </button>
      </form>
      {state.error && <p role="alert">{state.error}</p>}
      {state.created && (
        <p className="invite-result">
          Invite code: <strong>{state.created.inviteCode}</strong>
        </p>
      )}
    </div>
  );
}

function JoinGroupForm({ token, onJoined }) {
  const [state, submitAction, isPending] = useActionState(
    async (_prev, formData) => {
      const inviteCode = formData.get("inviteCode");
      try {
        const res = await fetch(`${HOST}api/groups/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inviteCode }),
        });
        if (!res.ok) throw new Error(await res.text());
        onJoined();
        return { error: null, success: true };
      } catch (e) {
        return { error: e.message, success: false };
      }
    },
    { error: null, success: false }
  );

  return (
    <div className="group-form-box">
      <h3>Join Group</h3>
      <form action={submitAction}>
        <label>
          Invite Code
          <input type="text" name="inviteCode" required />
        </label>
        <button disabled={isPending}>
          {isPending ? "Joining..." : "Join"}
        </button>
      </form>
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p className="invite-result">Joined!</p>}
    </div>
  );
}

function GroupDetail({ data, onLeave, currentUser }) {
  const { group, members, leaderboard } = data;

  // Organize leaderboard by game
  const games = {};
  for (const row of leaderboard) {
    if (!games[row.gameId]) {
      games[row.gameId] = { name: row.gameName, scores: [] };
    }
    games[row.gameId].scores.push({
      username: row.username,
      topScore: row.topScore,
    });
  }

  return (
    <div className="group-detail">
      <div className="group-detail-header">
        <h2>{group.name}</h2>
        <p className="group-code">Invite code: {group.inviteCode}</p>
        <button className="leave-btn" onClick={() => onLeave(group.id)}>
          Leave Group
        </button>
      </div>

      <div className="group-members">
        <h3>Members ({members.length})</h3>
        <div className="member-list">
          {members.map((m) => (
            <span key={m.id} className="member-tag">
              {m.username}
              {m.id === currentUser?.id ? " (you)" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="group-leaderboards">
        <h3>Leaderboards</h3>
        {Object.keys(games).length === 0 ? (
          <p>No scores yet.</p>
        ) : (
          Object.entries(games)
            .sort(([a], [b]) => a - b)
            .map(([gameId, game]) => (
              <div key={gameId} className="group-game-board">
                <h4>{game.name}</h4>
                <div className="group-scores">
                  {game.scores.map((s, i) => (
                    <div
                      key={s.username}
                      className={`group-score-row${i < 3 ? ` top-${i + 1}` : ""}`}
                    >
                      <span className="rank">{i + 1}</span>
                      <span className="username">{s.username}</span>
                      <span className="score">{s.topScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
