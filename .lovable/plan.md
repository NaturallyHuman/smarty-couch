
User wants a redesigned `GameOver` screen with a clear visual hierarchy: celebration → score → tier name → percentile → tier ladder with progress → key stats row → action buttons.

## Plan

**File: `src/pages/GameOver.tsx`** — full rewrite of the layout (keep data sources/effects).

### Layout (top → bottom, centered)

1. **Celebration burst** — subtle CSS confetti/glow behind the title. Pure CSS (radial gradient + animated pulse), no library. Fades in on mount.
2. **"QUIZ COMPLETE"** — small uppercase tracked label.
3. **Big score** — `4,850` style, huge tabular numerals, primary color, scale-in animation.
4. **Tier name** — e.g. "Quick Thinker", computed from final score.
5. **Percentile line** — "Top X% of your runs" calculated from `recentScores` (rank current score against history).
6. **Tier ladder** — 5 pills horizontally: `Warm-Up · Sharp Guess · Quick Thinker · Fact Machine · Trivia Titan`. Current tier highlighted (primary bg + scale-up). Connecting line between them. Small caret/arrow under the active one.
7. **"X pts to next rank"** — distance to next tier threshold (or "Max rank!" at top).
8. **Stats row** — 3 inline stats: `Accuracy 78%` · `Best streak 9` · `Best category Science`. Separated by dots/dividers.
9. **Action buttons** — `Play Again` (primary, focused by default) and `Home` (secondary). Both navigate to `/`.

### Tier system (new, in same file)

```
0       → Warm-Up
1500    → Sharp Guess
3000    → Quick Thinker
5000    → Fact Machine
8000    → Trivia Titan
```
Helpers: `getTier(score)`, `getNextTierThreshold(score)`.

### Cut from current screen
Remove the category breakdown card, last-10 bar chart, and awards grid. The new layout absorbs the essentials (best category, best streak, percentile-as-comparison) into a single clean line. Other utilities (`awards.ts`, `recentScores`) stay in place — just not rendered here. (If you want awards/history kept somewhere, say so and I'll add a "more details" toggle.)

### Data sources (unchanged)
- `gameState.players[0]` for score, accuracy, streak, category breakdown.
- `recordGameScore(finalScore)` still called once on mount.
- `recentScores` used for percentile calc instead of bar chart.

### Styling notes
- Use existing tokens (`text-primary`, `bg-card`, `text-muted-foreground`, `text-success`).
- Tier pills: `rounded-full px-3 py-1 text-sm`, active pill `bg-primary text-primary-foreground scale-110`, others `bg-muted text-muted-foreground`. Connector: thin horizontal line behind pills.
- Score uses `text-7xl font-bold tabular-nums text-primary animate-scale-in`.
- Confetti = CSS-only: a few absolutely-positioned dots with `animate-pulse` at varied delays + a soft radial-gradient glow behind the title.
- Two `TVButton`s side-by-side; D-pad lands on Play Again first.

### Files touched
- `src/pages/GameOver.tsx` only.

No new dependencies. No type changes. Routing unchanged.
