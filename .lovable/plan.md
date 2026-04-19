
Two tweaks across two files.

## 1. `src/components/TimerBar.tsx`
- Rename the optional prop from `questionNumber` to `score` (number). Render it the same way (pill, top-right of TimerBar row, large tabular-nums) — just no label, just the number, formatted with `toLocaleString()` so 4-digit scores look right. Bump `min-w` slightly so 4–5 digit numbers fit.

## 2. `src/pages/Question.tsx`
- Pass `score={score}` to `<TimerBar>` instead of `questionNumber`.
- In the center D-pad badge, replace `score.toLocaleString()` with the **bonus count** (`streakBonus.toLocaleString()` — the running total of streak bonus points earned this round, already tracked in state).
- Keep the existing `scorePopup` floating animation above the badge so players still see `+100 / +50 bonus` feedback when they answer. The popup stays anchored to the center badge.
- Header row (category + streak indicator) stays as-is.

## Notes
- `streakBonus` is already accumulated in the `handleAnswer` correct branch (`setStreakBonus((prev) => prev + breakdown.streak)`), so no scoring logic changes — just surfacing it.
- It resets to 0 implicitly each round because the component remounts on round transition (state reinitializes).
- The question counter visible up top is removed by this change. The user explicitly asked for score there instead, so that's intentional.

## Files touched
- `src/components/TimerBar.tsx` — rename prop, format with `toLocaleString`, widen pill.
- `src/pages/Question.tsx` — swap TimerBar prop; swap center badge to show `streakBonus`.

No other files, no new dependencies.
