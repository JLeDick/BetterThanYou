# BetterThanYou Project Planning

## Stage 1 — Project Setup & Database

Get the skeleton standing before writing any features.

- [ ] Initialize Vite + React frontend in `client/`
- [ ] Initialize Express backend in `server/`
- [ ] Set up PostgreSQL locally, create the database
- [ ] Create all tables: `users`, `games`, `scores` (leave `groups`/`group_members` for stretch)
- [ ] Seed the `games` table with your first 2 games (name, slug, description)
- [ ] Verify the backend connects to the DB and can query the games table
- [ ] Set up basic project structure (routes, controllers, middleware folders on backend; pages, components folders on frontend)
- [ ] Get a basic health-check route (`GET /api/health`) returning JSON

**Done when:** Backend runs, DB has tables, `GET /api/games` returns your seeded games.

---

## Stage 2 — Auth

Everything downstream depends on knowing who the user is.

- [ ] `POST /api/auth/register` — validate input, hash password with bcrypt, insert user, return JWT
- [ ] `POST /api/auth/login` — verify credentials, return JWT
- [ ] `GET /api/auth/me` — verify token, return user info
- [ ] Auth middleware that extracts and verifies JWT from `Authorization` header
- [ ] Frontend: Register page, Login page, store token (localStorage or context)
- [ ] Frontend: Auth context/provider so components know if user is logged in
- [ ] Protected routes / conditional rendering (e.g., "Login" vs username in nav)
- [ ] Logout (clear token)

**Done when:** You can register, login, refresh the page and stay logged in, and hit a protected endpoint.

---

## Stage 3 — Games & Score Submission

The core loop: play a game, save a score.

- [ ] Build your first game as a React component
- [ ] Build your second game as a React component
- [ ] Standardize how games report scores — each game calls one callback like `onGameEnd(score)` when finished
- [ ] `GET /api/games` — list all games (already done in Stage 1, wire it to frontend)
- [ ] `GET /api/games/:slug` — single game details
- [ ] Home page (`/`) — game selection grid that links to `/games/:slug`
- [ ] Game page (`/games/:slug`) — loads the correct game component by slug
- [ ] `POST /api/scores` — submit `{ game_id, score }`, requires auth
- [ ] After a game ends: if logged in, submit score to API; if not, show score but prompt to log in to save
- [ ] Anonymous play works — game is fully playable without an account

**Done when:** You can pick a game from the home page, play it, and the score saves to the database.

---

## Stage 4 — Profile & Leaderboard

Now that scores exist, let users see them.

- [ ] `GET /api/scores/leaderboard/:gameId` — top N scores for a game, joined with username
- [ ] Leaderboard page (`/leaderboard`) — dropdown or tabs to filter by game, shows ranked scores
- [ ] `GET /api/users/:username` — public profile with best score per game
- [ ] Profile page (`/profile`) — your own stats: best scores per game, recent attempts, total games played
- [ ] Score history — show recent scores, not just the best

**Done when:** Leaderboard shows real scores, profile page shows your stats.

---

## Stage 5 — Polish & Deploy

Make it feel finished.

- [ ] Mobile-first responsive pass on all pages (this is an MVP requirement)
- [ ] Consistent styling / layout across pages (nav, footer, spacing)
- [ ] `DELETE /api/scores/:gameId` — reset your scores for a game
- [ ] `DELETE /api/scores` — reset all your scores
- [ ] Score reset UI on the profile page
- [ ] Error handling: API errors surface user-friendly messages on the frontend
- [ ] Loading states for async operations
- [ ] Deploy backend + frontend to Render/Railway
- [ ] Deploy database to Neon/Supabase
- [ ] Test the deployed app end-to-end

**Done when:** App is live, mobile-friendly, and the full MVP flow works in production.

---

## Stretch

Only after MVP is solid. Each is independent — pick based on interest.

- [ ] **Head-to-Head Comparison** — `GET /api/compare/:username`, comparison page (`/compare`) with side-by-side best scores
- [ ] **Groups** — create `groups`/`group_members` tables, `POST /api/groups`, `POST /api/groups/join`, `GET /api/groups/:id`, invite code system, group leaderboard page
- [ ] **More Games** — each new game is just a React component + a row in the `games` table
- [ ] **Score Improvement Charts** — graph score history over time per game on the profile page
- [ ] **Further Mobile Polish** — animations, touch targets, transitions
