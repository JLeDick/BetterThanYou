# BetterThanYou

## Mission Statement

Prove that you're better than your friends with a multitude of games, puzzles and speed tests, all with persistent scoring, leaderboards, group high scores and direct comparisons with other users.

## About

This project is going to be centered around one idea; people like comparing their scores with their friends. This project is going to be a collection of minigames that will allow users to get their own high scores, track their own progress and create groups to compare with their friends. There will be an individual score for each game. They will be able to compare directly with other users by typing in the other user's username (or ID) [think OSRS HiScores] or they will be able to create groups where they will have their own localized leaderboard among their friends.

The goal is to make this scalable in the sense that adding new games will only require the logic for that game and a new page. The scores will be added just by adding another row to the games table in the backend. Since the leaderboard, comparison page and group page will all be querying the `{ game_id, score }`, it will be fairly easy to add in games in the future. Each game will be its own React component. The only thing that will need to be standardized is how the game talks to the rest of the app.

---

## MVP

- Auth (register, login, logout)
- 2 playable games
- User profile with score history / score saving
- Global leaderboard (per-game)
- Mobile Optimized

## Stretch

- Head-to-Head Comparison
- Groups with Invite Codes
- More Games
- Score Improvement Charts/Graphs
- Further Mobile Optimizations with Polish

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Express.js
- **Database:** PostgreSQL
- **Auth:** bcrypt + JWT
- **Hosting:** Render / Railway (free tier) + Neon or Supabase (database)

## Pages

| Route          | Description                                     |
| -------------- | ----------------------------------------------- |
| `/`            | Home — game selection grid                      |
| `/games/:slug` | Individual game page (dynamic route per game)   |
| `/leaderboard` | Global leaderboard, filterable by game          |
| `/profile`     | Your stats and score history                    |
| `/compare`     | Head-to-head score comparison with another user |
| `/groups/:id`  | Group leaderboard and members list              |
| `/login`       | Login                                           |
| `/register`    | Register                                        |

## Database Schema

### users

| Column        | Type      | Notes         |
| ------------- | --------- | ------------- |
| id            | SERIAL    | Primary key   |
| username      | VARCHAR   | Unique        |
| email         | VARCHAR   | Unique        |
| password_hash | VARCHAR   | bcrypt hashed |
| created_at    | TIMESTAMP | Default now() |

### games

| Column      | Type    | Notes                   |
| ----------- | ------- | ----------------------- |
| id          | SERIAL  | Primary key             |
| name        | VARCHAR | Display name            |
| slug        | VARCHAR | URL-friendly identifier |
| description | TEXT    | Short game description  |

### scores

| Column     | Type      | Notes          |
| ---------- | --------- | -------------- |
| id         | SERIAL    | Primary key    |
| user_id    | INT       | FK → users     |
| game_id    | INT       | FK → games     |
| score      | INT       | Player's score |
| created_at | TIMESTAMP | Default now()  |

### groups

| Column      | Type      | Notes                                   |
| ----------- | --------- | --------------------------------------- |
| id          | SERIAL    | Primary key                             |
| name        | VARCHAR   | Group display name                      |
| invite_code | VARCHAR   | Random 6-8 character string for joining |
| created_by  | INT       | FK → users                              |
| created_at  | TIMESTAMP | Default now()                           |

### group_members

| Column    | Type      | Notes                      |
| --------- | --------- | -------------------------- |
| group_id  | INT       | FK → groups (composite PK) |
| user_id   | INT       | FK → users (composite PK)  |
| joined_at | TIMESTAMP | Default now()              |

## API Endpoints

### Auth

| Method | Endpoint             | Description                 | Auth? | Tables |
| ------ | -------------------- | --------------------------- | ----- | ------ |
| POST   | `/api/auth/register` | Create account              | No    | users  |
| POST   | `/api/auth/login`    | Login, returns JWT          | No    | users  |
| GET    | `/api/auth/me`       | Get current user from token | Yes   | users  |

### Games

| Method | Endpoint           | Description             | Auth? | Tables |
| ------ | ------------------ | ----------------------- | ----- | ------ |
| GET    | `/api/games`       | List all games          | No    | games  |
| GET    | `/api/games/:slug` | Get single game details | No    | games  |

### Scores

| Method | Endpoint                          | Description                         | Auth? | Tables        |
| ------ | --------------------------------- | ----------------------------------- | ----- | ------------- |
| POST   | `/api/scores`                     | Submit a score `{ game_id, score }` | Yes   | scores        |
| GET    | `/api/scores/leaderboard/:gameId` | Top scores for a game               | No    | scores, users |
| DELETE | `/api/scores/:gameId`             | Reset your scores for a game        | Yes   | scores        |
| DELETE | `/api/scores`                     | Reset all your scores               | Yes   | scores        |

### Users

| Method | Endpoint               | Description                  | Auth? | Tables               |
| ------ | ---------------------- | ---------------------------- | ----- | -------------------- |
| GET    | `/api/users/:username` | Public profile + best scores | No    | users, scores, games |

### Compare (stretch)

| Method | Endpoint                 | Description           | Auth? | Tables               |
| ------ | ------------------------ | --------------------- | ----- | -------------------- |
| GET    | `/api/compare/:username` | Your scores vs theirs | Yes   | users, scores, games |

### Groups (stretch)

| Method | Endpoint                | Description                       | Auth? | Tables                               |
| ------ | ----------------------- | --------------------------------- | ----- | ------------------------------------ |
| POST   | `/api/groups`           | Create group, returns invite code | Yes   | groups                               |
| POST   | `/api/groups/join`      | Join via `{ invite_code }`        | Yes   | group_members                        |
| GET    | `/api/groups/:id`       | Group leaderboard + members       | Yes   | groups, group_members, scores, users |
| DELETE | `/api/groups/:id/leave` | Leave a group                     | Yes   | group_members                        |

## Authentication

Email + password. Passwords hashed with bcrypt, sessions managed with JWT. Anonymous users can play games but cannot save scores. Authenticated users can save scores, join groups, and access leaderboards/comparisons.

## Features

### Score Comparison

Search by username for a side-by-side view: your best score vs. theirs per game, total games played. Simple bar charts or a clean comparison table.

### Groups

Create a group, get a random invite code. Share the code, others join. Group page shows a per-game leaderboard of all members. No approval flow, no admin panel — lightweight.

### Score Persistence

All scores are kept. Top scores derived via `MAX()` queries. Keeping history enables showing recent attempts and improvement over time.

### Score Reset

Per-game reset available (`DELETE FROM scores WHERE user_id = ? AND game_id = ?`). Option for full account score reset as well.

## Design

- Mobile-first responsive design (primary target: mobile browsers)
- Modern and clean with personality — playful color palette, rounded corners, subtle animations
- Flexible grid layouts, appropriately sized touch targets
- No React Native — just responsive CSS with media queries

## Hosting & Domain

### Database Hosting

- **Development:** Local PostgreSQL
- **Production:** Free managed service (Neon, Supabase, or Render PostgreSQL)

### App Hosting

- Render or Railway free tier for frontend and backend

### Domain Options

| TLD  | Price      | Notes                           |
| ---- | ---------- | ------------------------------- |
| .com | ~$10/yr    | Cheapest, but name likely taken |
| .gg  | ~$10-15/yr | Gaming-associated, great fit    |
| .io  | ~$30-50/yr | Tech-associated, overpriced     |

Recommended registrars: Porkbun, Cloudflare Registrar

// User Stories are the end users experience

// as a user I can login to my account and play daily game for today

// can compare between users

// As a [blank] I want to [blank] so [blank]

Remove the try catches from my queries because the catch will swallow the error
and I want to actually throw it because postgres throws very useful errors
It will do stuff like type validation and foreign key validation
