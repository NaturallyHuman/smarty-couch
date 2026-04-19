
## Two changes

### 1. Score should be cumulative across rounds (not reset to 0 each round)

**Current behavior:** Each round starts `score = gameState.currentRoundScore` which is always `0` after a round ends. The displayed score in `Question.tsx` shows only the current round. The cumulative total is hidden inside `player.totalScore` and only surfaces on the final screen.

**Bug per the user:** Visually the score appears to "reset" between rounds because the in-game score display restarts at 0 for round 2 and round 3.

**Fix in `src/pages/Question.tsx`:**
- Initialize `score` from `gameState.players[currentPlayer].totalScore + gameState.currentRoundScore` so the displayed score continues from where the previous round ended.
- Track a separate `roundStartScore` ref so when the round ends we still push the correct *round-only* delta into `player.roundScores` and add only the round's points to `totalScore` (no double-counting).
- Net effect: score on screen never resets; `player.totalScore` math stays correct; `roundScores` array stays per-round.

### 2. Redesign Quiz Complete screen to match the uploaded mockup

**Layout (centered, matches user's image):**

```
                Final Score
                  2,400

               Quick Thinker!


  Best streak     Best category    Worst category
       8             History           Science
  2300 points!        9/9               3/9


              [ Play Again ]   [ Home ]
```

**Specifics:**
- "Final Score" eyebrow (small uppercase muted), then the big number (`text-7xl tabular-nums text-primary`).
- Tier name as a single line with `!` (e.g. "Quick Thinker!"). Same TIERS table as today.
- Three-column stat row with generous spacing:
  - **Best streak** — number + secondary line showing points contributed by streak bonuses this game (use `streakBonusTotal` — see logic note below).
  - **Best category** — name + `correct/attempted`.
  - **Worst category** — name + `correct/attempted` (lowest accuracy with min 2 attempts; if only one category played, hide this column).
- Two buttons at the bottom: Play Again (focused) and Home.
- Keep existing celebration glow + confetti dots.
- Drop the percentile line and tier ladder pills (mockup doesn't show them). Keep them out unless requested.

**Logic verification / fixes:**
- **Best/Worst category** computed from `attemptedByCategory` and `correctByCategory` on `players[0]`. Min 2 attempts to qualify. Worst = lowest accuracy among qualifying; tie-break by lower correct count.
- **Best streak points**: track total `streakBonus` accumulated across the whole game. Currently `streakBonus` resets each round in `Question.tsx` and is never persisted. Add `streakBonusTotal` to `PlayerStats` (in `src/types/game.ts`) and merge it into the player at round end the same way other aggregates merge.
- **Score number shown** = `player.totalScore` (now accurate since score is cumulative end-to-end).

### Files touched
- `src/pages/Question.tsx` — initialize displayed score from cumulative total; fix round-end math to add only round delta; track and persist `streakBonusTotal`.
- `src/types/game.ts` — add `streakBonusTotal?: number` to `PlayerStats`.
- `src/pages/GameOver.tsx` — new layout per mockup; add worst-category helper; use `streakBonusTotal` for the "X points!" subline.

No new dependencies. No routing changes. Tier thresholds and styling tokens unchanged.
