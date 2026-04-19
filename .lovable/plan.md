
Two small tweaks to `src/pages/Question.tsx`:

1. **Center badge content** — Replace `streakBonus.toLocaleString()` with `streak` (the live streak count, already in state). Resets to 0 on wrong answer (already wired in `handleAnswer`). Remove the related `streakBonus` plumbing from the badge itself but leave the `setStreakBonus` state intact for now (harmless, used nowhere visible after this change — can prune later if desired).

2. **Remove purple border + glow** — Strip `border-2 border-primary/60` and `shadow-[0_0_18px_hsl(var(--primary)/0.35)]` from the badge. Keep the rounded card background so the number still reads as a discrete element. Result: a clean circular badge showing just the streak number.

Score popup (`+points / +bonus`) stays anchored above the badge — still useful feedback.

## Files touched
- `src/pages/Question.tsx` — swap badge content to `streak`, drop border/glow classes.
