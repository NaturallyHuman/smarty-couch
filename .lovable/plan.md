
Two changes in `src/pages/Question.tsx`, plus a logic verification.

## 1. Center D-pad badge → live streak counter

- Replace `{streakBonus.toLocaleString()}` with `{streak}` so the badge shows the current streak (0, 1, 2, 3…).
- On wrong answers `streak` is already reset to 0 in `handleAnswer`, so the badge will naturally drop to 0.
- Keep the `scorePopup` floating animation above the badge unchanged — players still see `+100 / +bonus` feedback.

## 2. Remove purple border around badge

- Strip `border-2 border-primary/60` and the purple glow `shadow-[0_0_18px_hsl(var(--primary)/0.35)]` from the badge wrapper.
- Keep the `bg-card` fill and rounded shape so it still reads as a centered chip, just neutral instead of purple-ringed.

## 3. Cross-round score persistence (verification)

Reviewed the round-end flow in `Question.tsx` + how state seeds on mount:

- On mount: `setScore(gameState.currentRoundScore)` — seeds from `gameState`, which is reset to `0` by `handleRoundEnd` before navigating. So each round's local `score` starts at 0. ✓ (intended — round score, not cumulative)
- On round end: `currentPlayer.totalScore += score` — the round's score is added to the player's running `totalScore`. ✓
- The top-right pill in `TimerBar` is fed `score={score}` — i.e. **current round score**, not total. This is consistent within a round but resets visually between rounds.

The user says the upper-right number "should remain consistent across all three rounds." Two valid interpretations:
- **(a)** It should display the **cumulative total score across rounds** (round 2 starts where round 1 ended).
- **(b)** It should just *behave consistently* (same logic, same display) round to round — which it already does.

Given the wording ("remain consistent across all three rounds"), I'm reading this as **(a)**: the upper-right number should be the player's running total, not just the current round's score. Fix:

- Change the `TimerBar` score prop to `gameState.players[gameState.currentPlayer].totalScore + score` so it shows previous rounds' accumulated total plus what's been earned this round. Round-to-round it grows monotonically; on round end the round's `score` flushes into `totalScore` and the new round starts adding from there — visually seamless.

If the user actually meant (b), this still works: the number will still be consistent (and now also more meaningful).

## Files touched
- `src/pages/Question.tsx` — badge content swap, badge styling trim, TimerBar `score` prop changed to cumulative.

No scoring math changes. No other files.
