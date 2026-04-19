
## Bug found

The **GameOver screen shows zeros because the timer's round-end handler reads stale state via closure.**

In `Question.tsx`, the `setInterval` is created in a useEffect with deps `[questions.length, showPauseDialog]` — neither changes during a round. So the interval callback closes over the **initial render values** of `score`, `correctCount`, `attemptedCount`, `streakBonus`, `maxStreak`, `correctByCategory`, `attemptedByCategory` — all `0` / `{}`.

When the 60s timer expires → calls `handleRoundEnd()` → `roundDelta = score(0) - roundStartScoreRef(0) = 0` → `currentPlayer.totalScore += 0`. Same for `correctAnswers`, `streakBonusTotal`, category maps. Every round contributes 0. GameOver renders 0 score, no category data → Best/Worst category columns hide → "wrong layout" with just an empty "Best streak: 0, 0 points!" column.

When the round previously ended via `moveToNext` (running out of questions), it worked because `moveToNext` was called from the click/key handler which has fresh closures. The timer expiring is the broken path.

(The "wrong layout" complaint is a downstream symptom — the layout itself matches the approved mockup, but with zero data the category columns hide and only a single sparse "Best streak" column shows, which looks broken.)

## Fix — `src/pages/Question.tsx`

1. **Mirror live state into refs** so `handleRoundEnd` always reads current values:
   - `scoreRef`, `correctCountRef`, `attemptedCountRef`, `maxStreakRef`, `streakBonusRef`, `correctByCategoryRef`, `attemptedByCategoryRef`, `currentIndexRef`, `lastWasWrongRef` (already exists).
   - Update each ref in a small `useEffect` that watches its corresponding state value.

2. **Rewrite `handleRoundEnd` to read from refs** instead of closure variables. This makes it correct whether called from the timer, the key handler, or `moveToNext`.

3. **Decouple navigate from the setState updater** to silence the React warning and avoid render-phase navigation:
   - Inside the timer's `setTimeRemaining` updater, just return `0` and set a `timeUpRef.current = true` flag (or just rely on `prev <= 1`).
   - Add a separate `useEffect` watching `timeRemaining` — when it hits 0 and `roundEndedRef.current` is false, call `handleRoundEnd()`.

4. **Keep all existing scoring logic intact** — only reading sources change. `roundStartScoreRef` and the cumulative-score init stay the same.

## Files touched
- `src/pages/Question.tsx` — add refs that mirror state; refactor `handleRoundEnd` to read from refs; move timer-expiry navigation out of the setState updater into a `timeRemaining`-watching effect.

No changes needed to `GameOver.tsx`, `RoundIntro.tsx`, types, or routing. Once real data flows through, the layout naturally fills in (Best streak with real bonus points, Best category, Worst category) exactly per the approved mockup.
