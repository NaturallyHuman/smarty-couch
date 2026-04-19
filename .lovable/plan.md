
Quick read of current behavior in `src/pages/Question.tsx`:

- `score` only ever **increases** by `points` on a correct answer. It's never reset on a wrong answer.
- What does reset on a wrong answer is `streak` → 0, which kills future streak bonuses until the player builds it back up.

So the actual score (cumulative points from correct answers) already does **not** reset on a wrong answer. The thing that "resets" is the streak bonus pipeline, which is the intended behavior the user is describing.

There's one thing worth confirming though: `streakBonus` state exists in `Question.tsx` but I don't see it displayed anywhere on the question screen (it's tracked but unused visually). And the round score, total score, etc. all behave correctly.

## Likely what the user is actually seeing

The user thinks the score resets on a wrong answer. Two possibilities:

1. **The streak counter visibly disappears** ("🔥 5 streak" vanishes when they get one wrong) and they're reading that as "score reset."
2. **The displayed score genuinely looks like it dropped** — which would only happen if there's a rendering bug.

Looking at the code carefully: `setScore((prev) => prev + points)` only runs on correct. On wrong, score is untouched. So there's no actual reset bug.

## Plan

Since the underlying behavior is already correct, the fix is **clarity, not logic**. Make it visually obvious that the score is preserved and only the streak/bonus is lost:

**File: `src/pages/Question.tsx`**

1. **Keep the score display permanent and stable** — it already is, no change needed.
2. **On a wrong answer, briefly show a "Streak lost" flash** in place of the streak indicator (e.g., "💔 Streak lost" for ~600ms) so the player understands what just reset. Then it disappears until they build a new streak ≥2.
3. **Add a subtle "+100 +50 bonus" floating popup** near the score when a correct answer with bonus is awarded, so players feel the bonus mechanic clearly (this also makes it obvious the bonus is the *only* thing tied to the streak).

That's it — no scoring math changes, just visual reinforcement that score is permanent and only streak bonuses are at risk.

If the user is reporting an actual bug where the score number drops on wrong answers, I'd need a repro (it doesn't happen in the current code). I'll flag that in my response so they can confirm.

## Files touched
- `src/pages/Question.tsx` — add streak-lost flash + optional score popup on bonus.

No other files affected. No new dependencies.
