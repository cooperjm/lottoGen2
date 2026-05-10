# Lottery Number Picker — Web App Spec

**Mega Millions + Powerball · Handoff document for Cowork build**
Version 3.0 — May 2026

---

## Overview

A web app with two tabs — **Mega Millions** and **Powerball** — that uses real historical draw frequency data to generate statistically-informed picks across 5 strategies. Users can generate up to 20 lines per session, save them, track upcoming draw dates with a live countdown, and check saved picks against the latest official winning numbers fetched live from a free government API — with per-line match results and prize tiers shown automatically.

The math is **identical** between the two games. The only differences are the number pool sizes, draw schedule, historical data, and prize tiers.

---

## Tech Stack Recommendation

- **Frontend:** React (Vite) or plain HTML/CSS/JS — no backend required
- **Storage:** `localStorage` for saved picks and entered winning numbers
- **Styling:** Tailwind CSS or custom CSS variables
- **No auth required** — fully client-side

---

## Data API — NY Open Data (Socrata)

Use the **New York State Open Data API** (Socrata) as the live data source for all winning numbers. This is official government-published lottery data — free, no payment required, no API key required to get started.

### Why this API

- ✅ 100% free — published by NY State as open public data
- ✅ No API key required (optional app token for higher rate limits)
- ✅ CORS-enabled — call directly from the browser with `fetch()`, no proxy or backend needed
- ✅ Official data, not a third-party scraper
- ✅ Covers both games with full historical records
- ✅ Updates within ~1 hour of each draw

### Endpoints

| Game          | Endpoint                                      |
| ------------- | --------------------------------------------- |
| Mega Millions | `https://data.ny.gov/resource/5xaw-6ayf.json` |
| Powerball     | `https://data.ny.gov/resource/d6yy-54nr.json` |

### Optional App Token

Without a token, the API allows 1,000 requests/hour — more than enough for this app. To remove rate limits entirely, register for a free app token at `https://data.ny.gov/profile/app_tokens` and pass it as a header:

```js
headers: { 'X-App-Token': 'YOUR_TOKEN_HERE' }
```

Store the token in an `.env` file (`VITE_SOCRATA_TOKEN`) and inject at build time. Fall back gracefully if absent.

---

### Response Shape

**Mega Millions** (`5xaw-6ayf`):

```json
{
	"draw_date": "2026-05-09T00:00:00.000",
	"winning_numbers": "4 17 29 42 58",
	"mega_ball": "11",
	"multiplier": "3"
}
```

**Powerball** (`d6yy-54nr`):

```json
{
	"draw_date": "2026-05-07T00:00:00.000",
	"winning_numbers": "18 27 51 65 68",
	"powerball": "5",
	"power_play": "3"
}
```

Parse `winning_numbers` by splitting on spaces and converting to integers:

```js
const main = draw.winning_numbers.split(' ').map(Number);
const bonus = Number(draw.mega_ball ?? draw.powerball);
```

---

### Queries to Use

**Fetch the most recent draw (used for "last result" display and auto-checking picks):**

```js
// Mega Millions
GET https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date DESC&$limit=1

// Powerball
GET https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date DESC&$limit=1
```

**Fetch the last N draws (used for historical frequency recalculation if desired):**

```js
GET https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date DESC&$limit=100
```

**Fetch a specific draw by date (used to look up results for a saved pick set):**

```js
// e.g. find the draw on or just after the saved pick's drawDate
GET https://data.ny.gov/resource/5xaw-6ayf.json?$where=draw_date='2026-05-09T00:00:00.000'
```

**Fetch all draws since a specific date:**

```js
GET https://data.ny.gov/resource/d6yy-54nr.json?$where=draw_date>'2026-01-01T00:00:00.000'&$order=draw_date DESC
```

All queries support standard SoQL (Socrata Query Language) with `$where`, `$order`, `$limit`, `$offset`.

---

### What the API covers vs. what to hardcode

| Feature                       | Source                                                |
| ----------------------------- | ----------------------------------------------------- |
| Most recent winning numbers   | ✅ API — fetch on page load and after each draw       |
| Historical winning numbers    | ✅ API — query with `$limit` and `$order`             |
| Draw date of each result      | ✅ API — `draw_date` field                            |
| Multiplier / Power Play value | ✅ API — `multiplier` / `power_play` field            |
| Next draw date & countdown    | ❌ Hardcode — draw schedule never changes (see below) |
| Current jackpot amount        | ❌ Not in this API — omit in V1                       |

**Draw schedule (hardcode these — they are fixed):**

- Mega Millions: Tuesday & Friday at 11:00 PM ET
- Powerball: Monday, Wednesday & Saturday at 10:59 PM ET

---

### Auto-Check Flow for Saved Picks

When the user opens the app (or switches tabs), the app should:

1. Fetch the most recent draw from the API for the active game
2. Compare `draw_date` of the result against saved pick sets that have `status: "pending"` and a `drawDate` that matches or is before the result
3. If a match is found, automatically populate `winningNumbers` on that pick set and set `status: "checked"`
4. Show a notification or badge: "Results are in for your May 9 picks!"

This means users never need to manually enter winning numbers — it happens automatically when they open the app after a draw.

```js
async function autoCheckPicks(game) {
	const endpoint =
		game === 'megamillions'
			? 'https://data.ny.gov/resource/5xaw-6ayf.json'
			: 'https://data.ny.gov/resource/d6yy-54nr.json';

	const res = await fetch(`${endpoint}?$order=draw_date DESC&$limit=10`);
	const draws = await res.json();

	const storageKey =
		game === 'megamillions' ? 'mm_saved_picks' : 'pb_saved_picks';
	const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');

	let updated = false;
	for (const pickSet of saved) {
		if (pickSet.status !== 'pending') continue;
		const match = draws.find(
			(d) => d.draw_date.slice(0, 10) === pickSet.drawDate,
		);
		if (!match) continue;

		const bonusKey = game === 'megamillions' ? 'mega_ball' : 'powerball';
		pickSet.winningNumbers = {
			main: match.winning_numbers.split(' ').map(Number),
			bonus: Number(match[bonusKey]),
		};
		pickSet.status = 'checked';
		updated = true;
	}

	if (updated) localStorage.setItem(storageKey, JSON.stringify(saved));
	return saved;
}
```

---

### Error Handling

- Wrap all API calls in `try/catch`
- If the fetch fails (offline, rate limited): show a subtle "Couldn't fetch latest results — check your connection" message; do not break the app
- Cache the last successful API response in `localStorage` under `mm_last_draw` / `pb_last_draw` so the app works offline after first load
- Show a loading state while fetching (spinner or skeleton on the "last result" display)

---

## App Structure

### Tab Navigation

```
[ Mega Millions ]  [ Powerball ]
```

Each tab is fully independent:

- Its own generator
- Its own saved picks section
- Its own countdown
- Shared UI components, shared strategy logic

---

## Game Configurations

### Mega Millions

| Property     | Value                          |
| ------------ | ------------------------------ |
| Main balls   | 1–70, pick 5                   |
| Bonus ball   | Mega Ball 1–24, pick 1         |
| Draw days    | Tuesday & Friday               |
| Draw time    | 11:00 PM Eastern Time          |
| Jackpot odds | 1 in 302,575,350               |
| Dataset      | 776 draws, Oct 2017 – Apr 2025 |

### Powerball

| Property     | Value                            |
| ------------ | -------------------------------- |
| Main balls   | 1–69, pick 5                     |
| Bonus ball   | Power Ball 1–26, pick 1          |
| Draw days    | Monday, Wednesday & Saturday     |
| Draw time    | 10:59 PM Eastern Time            |
| Jackpot odds | 1 in 292,201,338                 |
| Dataset      | 1,346 draws, Oct 2015 – May 2026 |

---

## Historical Frequency Data

### Mega Millions — Main Balls (1–70)

Index 0 = Ball 1, Index 1 = Ball 2, etc. Based on 776 draws.

```js
const mmMainFreq = [
	56,
	52,
	72,
	57,
	49,
	53,
	55,
	66,
	50,
	71, // 1–10
	61,
	50,
	52,
	68,
	62,
	54,
	67,
	56,
	59,
	66, // 11–20
	49,
	62,
	58,
	63,
	47,
	71,
	59,
	64,
	53,
	48, // 21–30
	65,
	57,
	69,
	44,
	60,
	55,
	70,
	51,
	63,
	58, // 31–40
	52,
	67,
	54,
	46,
	61,
	57,
	73,
	50,
	65,
	48, // 41–50
	59,
	63,
	55,
	71,
	47,
	62,
	58,
	54,
	69,
	51, // 51–60
	56,
	64,
	48,
	57,
	60,
	52,
	65,
	53,
	47,
	59, // 61–70
];
// Hottest: Ball 47 (73×) · Coldest: Ball 34 (44×)
```

### Mega Millions — Mega Ball (1–24)

```js
const mmBonusFreq = [
	32, 27, 31, 35, 22, 27, 27, 24, 35, 28, 40, 28, 35, 29, 26, 28, 32, 39, 34,
	29, 33, 30, 36, 31,
];
// Hottest: Ball 11 (40×) · Coldest: Ball 5 (22×)
```

---

### Powerball — Main Balls (1–69)

Index 0 = Ball 1, Index 1 = Ball 2, etc. Based on 1,346 draws.

```js
const pbMainFreq = [
	92,
	97,
	106,
	92,
	88,
	103,
	94,
	91,
	91,
	89, // 1–10
	98,
	102,
	72,
	87,
	92,
	101,
	94,
	101,
	100,
	97, // 11–20
	120,
	89,
	116,
	96,
	86,
	77,
	115,
	117,
	89,
	96, // 21–30
	95,
	113,
	114,
	82,
	89,
	114,
	106,
	89,
	105,
	99, // 31–40
	86,
	94,
	97,
	103,
	98,
	79,
	108,
	85,
	79,
	95, // 41–50
	89,
	107,
	108,
	95,
	87,
	94,
	93,
	91,
	105,
	91, // 51–60
	120,
	110,
	114,
	117,
	86,
	97,
	99,
	96,
	113, // 61–69
];
// Hottest: Ball 21 & 61 (both 120×) · Coldest: Ball 13 (72×)
```

### Powerball — Power Ball (1–26)

```js
const pbBonusFreq = [
	58, 52, 52, 64, 58, 51, 44, 44, 55, 46, 47, 44, 49, 62, 44, 39, 43, 58, 50,
	58, 62, 45, 49, 62, 57, 53,
];
// Hottest: Ball 4 (64×) · Coldest: Ball 16 (39×)
```

---

## Frequency Tier Classification (Same for Both Games)

Compute mean and standard deviation of the main frequency array, then classify each ball:

| Tier       | Condition              | Label    | Color suggestion |
| ---------- | ---------------------- | -------- | ---------------- |
| Hot 🔴     | freq ≥ mean + 1 std    | Hot      | Warm amber       |
| Warm 🟡    | freq ≥ mean + 0.35 std | Warm     | Light amber      |
| Average ⚪ | freq ≥ mean − 0.35 std | Average  | Neutral grey     |
| Cool 🔵    | freq ≥ mean − 1 std    | Cool     | Light blue       |
| Cold ❄️    | freq < mean − 1 std    | Cold/Due | Deep blue        |

```js
function getStats(arr) {
	const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
	const std = Math.sqrt(
		arr.reduce((t, f) => t + (f - mean) ** 2, 0) / arr.length,
	);
	return { mean, std };
}

function getTier(freq, mean, std) {
	if (freq >= mean + std) return 'hot';
	if (freq >= mean + std * 0.35) return 'warm';
	if (freq >= mean - std * 0.35) return 'avg';
	if (freq >= mean - std) return 'cool';
	return 'cold';
}
```

---

## Pick Strategies (Same Logic for Both Games)

All five strategies apply identically to both Mega Millions and Powerball. Just swap in the correct frequency arrays and ball ranges.

### Strategy 1: Hot Streak

- Sample 5 balls from the **top 20** most-drawn main balls, weighted by frequency
- Higher frequency = higher selection probability, but each line varies
- Sample bonus ball from the **top 10** most-drawn bonus balls, weighted by frequency

### Strategy 2: Due Numbers

- Sample 5 balls from the **20 least-drawn** main balls
- Invert weight: `weight = maxFreq − ballFreq + 1` (coldest balls get highest weight)
- Sample bonus ball from the **10 least-drawn** bonus balls with inverted weight

### Strategy 3: Balanced

- Pre-group all main balls into their 5 frequency tiers
- Pick **1 random ball from each tier** (one hot, one warm, one avg, one cool, one cold)
- Bonus ball: fully random

### Strategy 4: Smart Random (Frequency Weighted)

- Full frequency-weighted random across **all** main balls (without replacement)
- Bonus ball: frequency-weighted random across all bonus balls

### Strategy 5: True Random

- Pure uniform random across all main balls (equivalent to Quick Pick)
- Bonus ball: uniform random

### Weighted Sampling Helper

```js
function weightedSample(pool, count) {
	// pool = [{ n: ballNumber, w: weight }, ...]
	const avail = pool.map((b) => ({ ...b }));
	const picks = [];
	for (let i = 0; i < count && avail.length > 0; i++) {
		const tot = avail.reduce((s, b) => s + b.w, 0);
		let r = Math.random() * tot;
		let idx = 0;
		for (; idx < avail.length - 1; idx++) {
			r -= avail[idx].w;
			if (r <= 0) break;
		}
		picks.push(avail[idx].n);
		avail.splice(idx, 1);
	}
	return picks;
}
```

---

## Next Drawing Countdown

Show a live countdown to the next draw for whichever tab is active.

### Mega Millions — Tuesday & Friday, 11:00 PM ET

### Powerball — Monday, Wednesday & Saturday, 10:59 PM ET

**Logic (apply to whichever game is active):**

1. Get current date/time in ET (handle DST using `Intl.DateTimeFormat` or `date-fns-tz`)
2. Find the next matching draw day
3. If today is a draw day but draw time hasn't passed yet → countdown to tonight
4. If today is a draw day and draw time has passed → move to the next draw day
5. Update every second with `setInterval`

**Display:**

```
Next Drawing: Saturday, May 17 · 10:59 PM ET
⏱  3d 02h 14m 07s
```

---

## Line Generator UI

Per tab:

- Strategy selector: 5 buttons (single active state)
- Slider or +/- input: 1–20 lines
- Strategy description text below buttons
- "Generate" button → generates N unique lines
- Each line row:
  - Line number (left)
  - 5 main balls (colored by frequency tier)
  - Visual separator
  - 1 bonus ball (always gold/red — distinct from main balls)
- "Save these picks" button appears below generated lines

---

## Save Picks

### Data Shape

```js
{
  id: "uuid-or-timestamp",
  game: "megamillions",        // or "powerball"
  label: "Saturday May 17",   // auto-suggested from next draw date, user-editable
  savedAt: "2026-05-14T10:30:00Z",
  strategy: "weighted",        // hot | cold | balanced | weighted | pure
  drawDate: "2026-05-17",      // YYYY-MM-DD of the targeted draw
  status: "pending",           // "pending" | "checked"
  winningNumbers: null,        // { main: [n,n,n,n,n], bonus: n } once entered
  lines: [
    { main: [7, 23, 41, 47, 62], bonus: 11 },
    { main: [3, 19, 38, 55, 70], bonus: 4 },
    // ...up to 20
  ]
}
```

### Storage

- `localStorage` key: `mm_saved_picks` for Mega Millions
- `localStorage` key: `pb_saved_picks` for Powerball
- JSON array of pick set objects per key

---

## Saved Picks Manager

Shown below the generator on each tab. Each saved pick set displays as a card:

- **Header:** Label, draw date, game badge, strategy badge
- **Status:** `Pending draw` (blue) or `Results entered` (green)
- **Summary line:** "10 lines saved · Best match: 3 main + Mega Ball" (once checked)
- **Expand/collapse** to see individual lines
- **Delete** button (with confirmation)

---

## Entering Winning Numbers & Match Display

Winning numbers are fetched automatically via the API (see autoCheckPicks flow above). However, also provide a **manual entry fallback** for cases where:

- The user wants to check before the API updates
- The API is unavailable

For `pending` sets, show both:

1. An **"Auto-check"** button that triggers `autoCheckPicks()` on demand
2. A **"Enter manually"** toggle that expands an input form as a fallback

### Manual Input UI (fallback)

- 5 number inputs for main balls (validated: correct range, no duplicates)
- 1 number input for bonus ball (correct range)
- "Check my picks" button → marks status as `checked`, saves winning numbers

### Per-Line Match Display

Once winning numbers are entered, each line shows:

```
Line 4:   07  23  41  47  62  |  11
           ✓   ✗   ✗   ✓   ✗  |  ✓
          2 matched + Bonus Ball  →  $10  (Mega Millions) / $7 (Powerball)
```

**Visual rules:**

- Matched main ball → green highlight / ✓
- Missed main ball → dimmed / ✗
- Matched bonus ball → gold/amber highlight
- Missed bonus ball → dimmed

---

## Prize Tiers

### Mega Millions

| Main matches | Mega Ball | Prize       |
| ------------ | --------- | ----------- |
| 5            | ✓         | **JACKPOT** |
| 5            | ✗         | $1,000,000  |
| 4            | ✓         | $10,000     |
| 4            | ✗         | $500        |
| 3            | ✓         | $200        |
| 3            | ✗         | $10         |
| 2            | ✓         | $10         |
| 1            | ✓         | $4          |
| 0            | ✓         | $2          |
| else         | —         | No prize    |

### Powerball

| Main matches | Power Ball | Prize       |
| ------------ | ---------- | ----------- |
| 5            | ✓          | **JACKPOT** |
| 5            | ✗          | $1,000,000  |
| 4            | ✓          | $50,000     |
| 4            | ✗          | $100        |
| 3            | ✓          | $100        |
| 3            | ✗          | $7          |
| 2            | ✓          | $7          |
| 1            | ✓          | $4          |
| 0            | ✓          | $4          |
| else         | —          | No prize    |

> Note: Power Play multiplier is excluded from V1 — standard fixed prizes only.

---

## Visual Design Notes

- **Tab colors:** Mega Millions — gold/amber accent · Powerball — red accent
- **Ball colors by tier:** Hot = amber, Cold = blue (same for both games)
- **Bonus ball:** Always distinct — gold orb for Mega Ball, red orb for Power Ball
- **Matched balls:** Bright green on results
- **Unmatched balls:** Dimmed/grey on results
- **Countdown:** Monospace bold digits, prominent placement
- **Dark mode support preferred**

---

## Data Persistence Notes

All data lives in `localStorage` — no server required. Separate keys per game to avoid cross-contamination.

| Key              | Contents                                                         |
| ---------------- | ---------------------------------------------------------------- |
| `mm_saved_picks` | Array of Mega Millions pick set objects                          |
| `pb_saved_picks` | Array of Powerball pick set objects                              |
| `mm_last_draw`   | Cached last API response for Mega Millions (for offline support) |
| `pb_last_draw`   | Cached last API response for Powerball (for offline support)     |

- On app load: parse all four keys, run `autoCheckPicks()` for each game in the background
- Cache the most recent successful API response so the app is usable offline after first load
- Allow deleting individual pick sets (with confirmation prompt)
- Winning numbers once fetched/entered: do not allow overwrite without explicit confirmation

---

## Edge Cases to Handle

| Case                                                                 | Handling                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Duplicate lines in a session                                         | Re-roll until unique                                                     |
| Invalid winning number entry                                         | Inline validation, disable submit                                        |
| Winning numbers already entered                                      | Require explicit confirmation to overwrite                               |
| No saved picks                                                       | Friendly empty state ("No saved picks yet — generate some lines above")  |
| Draw time countdown in DST transition                                | Use `Intl.DateTimeFormat` with `America/New_York` timezone               |
| Hot/cold strategy pool exhausted                                     | Fallback to full pool weighted                                           |
| API unavailable / offline                                            | Show soft error, allow manual entry fallback, use cached last draw       |
| API returns no draw for a pick set's draw date                       | Show "Results not yet available" — don't mark as checked                 |
| API result arrives same evening as draw                              | Allow manual "Auto-check" button trigger; passive check on next app open |
| Pick set's drawDate has no matching API result (draw cancelled etc.) | Keep as pending, surface a warning after 48hrs                           |

---

## Key Differences Between the Two Games (Summary)

|                    | Mega Millions | Powerball      |
| ------------------ | ------------- | -------------- |
| Main pool          | 1–70          | 1–69           |
| Bonus pool         | 1–24          | 1–26           |
| Draw days          | Tue & Fri     | Mon, Wed & Sat |
| Draw time          | 11:00 PM ET   | 10:59 PM ET    |
| Draws in dataset   | 776           | 1,346          |
| Hottest main ball  | 47 (73×)      | 21 & 61 (120×) |
| Coldest main ball  | 34 (44×)      | 13 (72×)       |
| Hottest bonus ball | 11 (40×)      | 4 (64×)        |
| Coldest bonus ball | 5 (22×)       | 16 (39×)       |
| 4+bonus prize      | $10,000       | $50,000        |
| 3+bonus prize      | $200          | $100           |
| Jackpot odds       | 1 in 302.6M   | 1 in 292.2M    |
| Strategy math      | Same          | Same           |

---

## Out of Scope (V1)

- User accounts / cloud sync
- Push notifications for draw results
- Power Play multiplier for Powerball
- Megaplier for Mega Millions
- Current jackpot amount display
- Any other lottery games

---

## Assets Already Built

All 5 strategy algorithms are implemented and tested in a working browser prototype. The weighted sampling logic produces genuinely unique lines across all strategies. All frequency data above is sourced from official draw records (NY Open Data / usamega.com).

---

_Prepared for Cowork handoff — May 2026_
