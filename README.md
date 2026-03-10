# Price Guesser

A web game where players guess product prices, earn points based on accuracy, and compete on a leaderboard.

## How It Works

Each round you see a real product image and name. Guess its price — the closer you are, the more points you earn. Use lifelines when stuck (but they reduce your score). After all rounds, submit your score to the leaderboard.

### Scoring

```
roundScore = 1000 × e^(−3 × %error) × difficultyMultiplier × 0.8^lifelinesUsed + perfectBonus
```

- **Difficulty multipliers:** Easy = 1.0, Medium = 1.5, Hard = 2.0
- **Perfect bonus:** +500 points when guess is within 1%
- **Lifeline penalty:** ×0.8 per lifeline used that round

### Feedback Tiers

| Tier | Accuracy |
|------|----------|
| Perfect | ≤ 1% off |
| Close | ≤ 10% off |
| Warm | ≤ 25% off |
| Cold | ≤ 50% off |
| Way Off | > 50% off |

### Game Modes

| Mode | Rounds | Composition |
|------|--------|-------------|
| Quick | 5 | 1 easy, 3 medium, 1 hard |
| Full | 10 | 2 easy, 5 medium, 3 hard |

### Lifelines (2 per game)

- **Reveal Category** — Shows the product category and subcategory
- **Price Range** — Shows a ±50% range around the actual price

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Animations | Framer Motion |
| Map | Leaflet + react-leaflet |
| Database | Supabase (PostgreSQL) |
| Image Hosting | Supabase Storage |
| Theming | next-themes |
| Analytics | Vercel Analytics |

---

## Features

- 343 real products across 7 categories with difficulty balancing
- Dark/light theme toggle with system preference detection
- Mobile-responsive UI with touch-optimized controls
- Server-side scoring with anti-cheat (prices never sent to client before guess)
- UUID-based game sessions with 30-minute expiry
- Interactive world choropleth leaderboard map
- IP geolocation for country tracking

---

## Project Structure

```
├── app/
│   ├── page.tsx                     # Home / mode selection
│   ├── game/page.tsx                # Active game
│   ├── game-over/page.tsx           # Results & score submission
│   ├── leaderboard/page.tsx         # Leaderboard + world map
│   └── api/
│       ├── game/
│       │   ├── start/               # POST — create session
│       │   └── [sessionId]/
│       │       ├── guess/           # POST — score a guess
│       │       ├── lifeline/        # POST — use a lifeline
│       │       └── summary/         # GET  — full round results
│       └── leaderboard/
│           ├── route.ts             # GET — top entries
│           ├── submit/              # POST — submit score
│           └── countries/           # GET — country stats
├── components/
│   ├── game/                        # ProductCard, PriceInput, LifelineBar, RoundResult, GameHeader
│   ├── leaderboard/                 # WorldMap (Leaflet, dynamic import)
│   ├── ui/                          # Button
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── scoring.ts                   # Scoring algorithm
│   ├── sessions.ts                  # Game session store (Supabase)
│   ├── leaderboard.ts               # Leaderboard store (Supabase)
│   ├── products.ts                  # Product selection + difficulty balancing
│   ├── supabase.ts                  # Supabase client singleton
│   ├── api.ts                       # Typed client-side API helpers
│   ├── format.ts                    # Currency formatting
│   └── geolocation.ts               # IP geolocation
├── store/gameStore.ts               # Zustand state machine
├── types/index.ts                   # Shared TypeScript types
├── data/products.json               # 343 curated products
├── scripts/curate-products.ts       # Product curation + image pipeline
├── supabase/migrations/             # Database schema
└── public/countries.geojson         # World boundaries for Leaflet
```

---

## API Reference

### `POST /api/game/start`

Creates a new game session with randomized products.

**Body:** `{ mode: 5 | 10 }`
**Returns:** `{ sessionId, totalRounds, round: Product }`

### `POST /api/game/[sessionId]/guess`

Submits a price guess for the current round.

**Body:** `{ guess: number }`
**Returns:** `{ actualPrice, roundScore, totalScore, percentError, feedback, nextRound }`

### `POST /api/game/[sessionId]/lifeline`

Activates a lifeline for the current round.

**Body:** `{ type: 'category' | 'range' }`
**Returns:** Category info or price range

### `GET /api/game/[sessionId]/summary`

Returns full results after the game ends.

### `POST /api/leaderboard/submit`

Submits a score to the leaderboard. Country is detected server-side via IP geolocation.

**Body:** `{ sessionId, playerName }`

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set up the database

Run the migration in your Supabase SQL Editor:

```
supabase/migrations/001_initial_schema.sql
```

This creates two tables: `game_sessions` and `leaderboard`.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build (includes TypeScript checks) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Database Schema

### `game_sessions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Session identifier |
| `total_rounds` | SMALLINT | 5 or 10 |
| `products` | JSONB | Product list with prices (server-only) |
| `current_round` | SMALLINT | Current round index |
| `rounds_data` | JSONB | Completed round results |
| `total_score` | INTEGER | Running score |
| `lifelines_used` | JSONB | `{ category: bool, range: bool }` |
| `completed` | BOOLEAN | Game finished flag |
| `submitted` | BOOLEAN | Score submitted to leaderboard |
| `expires_at` | TIMESTAMPTZ | 30 minutes from creation |

### `leaderboard`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Entry identifier |
| `player_name` | TEXT | 1–30 characters |
| `score` | INTEGER | Final score |
| `rounds_played` | SMALLINT | Number of rounds |
| `game_mode` | SMALLINT | 5 or 10 |
| `country_code` | TEXT | ISO code from IP geolocation |
| `country_name` | TEXT | Full country name |
| `created_at` | TIMESTAMPTZ | Submission time |

---

## Deployment

Deploy to [Vercel](https://vercel.com) — no special configuration needed.

1. Push to your Git remote
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

Vercel Analytics is already integrated.
