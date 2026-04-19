
Refine `src/pages/GameOver.tsx` to feel more arcade-celebratory with a staged reveal, a clear card structure, and stronger visual hierarchy. No new files, no logic changes — same data sources (`gameState`, `recordGameScore`, tier math, percentile, accuracy, best category).

## Layout — single elevated card, four stacked zones

```
┌────────────────────────────────────────────────────┐
│             QUIZ COMPLETE  (eyebrow)               │
│                                                    │
│                  4,850                             │  ← oversized, count-up
│              (giant tabular numerals)              │
│                                                    │
│            ╭─────────────────╮                     │
│            │   QUICK THINKER │  ← rank badge pill  │
│            ╰─────────────────╯                     │
│            Top 18% of your runs                    │
│                                                    │
│  ●━━━●━━━◆━━━○━━━○                                 │  ← milestone ladder
│  Warm  Sharp QUICK  Fact Trivia                    │
│  Up    Guess THINKER Mach Titan                    │
│             350 pts to Fact Machine                │
│                                                    │
│  Accuracy 78% · Best streak 9 · Best Science       │  ← small stat row
│                                                    │
│        [ PLAY AGAIN ]    [ Home ]                  │
└────────────────────────────────────────────────────┘
```

## Changes

### 1. Card container
Wrap content in an elevated panel: `rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl px-12 py-10 max-w-3xl w-full`. Keeps existing confetti dots + radial glow as the busy background — the card sits on top for contrast.

### 2. Staged reveal (CSS-only, sequenced delays)
- Eyebrow: `animate-fade-in` (0ms)
- Score: count-up from 0 → final over ~900ms using a small `useEffect` with `requestAnimationFrame` and easeOutCubic. Already tabular-nums.
- Rank badge: `animate-scale-in` with `style={{ animationDelay: '950ms', animationFillMode: 'both' }}`
- Percentile line: fade in at 1100ms
- Ladder: fade/slide in at 1250ms
- Stats row: fade in at 1450ms
- Buttons: fade in at 1600ms (focus on Play Again still happens on mount)

### 3. Score
Bump to `text-8xl font-black tracking-tight text-primary tabular-nums`. Add a soft drop-shadow via `drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]` for the "victory moment" feel.

### 4. Rank badge
Replace the plain text tier with a real pill: `inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/40 px-6 py-2 text-2xl font-bold uppercase tracking-wider text-primary`. Adds personality without leaving the palette.

### 5. Milestone ladder
Keep the 5-tier line but upgrade visuals:
- Connector: gradient line `bg-gradient-to-r from-success via-primary to-warning` at 30% opacity, with the filled portion (up to current tier) at full opacity.
- Past tiers: small filled `success` dots.
- Current tier: larger diamond/ring with primary glow + scale-110.
- Future tiers: hollow muted dots.
- Tier labels under each dot, current one bold + primary color.
- Subtitle below ladder: `350 pts to Fact Machine` (already computed).

### 6. Stat row
Inline `· `-separated, slightly larger (`text-base`), labels muted, values bold foreground. Already wired — just style polish.

### 7. CTAs
- **Play Again** = primary, `size="large"`, slight pulse: add `animate-pulse` via a custom subtle ring (or wrap in a div with `shadow-[0_0_0_0_hsl(var(--primary)/0.5)] animate-pulse`). Visually dominates.
- **Home** = `variant="secondary"`, same size, less weight.
- D-pad lands on Play Again first (already implemented via ref).

### 8. Header
Replace "Quiz Complete" eyebrow with a slightly punchier "ROUND COMPLETE" in the same uppercase-tracked muted style. Keeps tone arcade-y per the brief.

## Files touched
- `src/pages/GameOver.tsx` only — restructure JSX into a card, add count-up effect, add staggered animation delays, restyle rank badge + ladder.

No new dependencies. No type changes. No routing changes. Existing tier math, percentile, recordGameScore, best category, and stats logic are preserved as-is.
