
User wants `RoundIntro.tsx` to become a 5-second taunt/encouragement screen with randomized messages, escalating between rounds. Currently it shows "Get Ready! / Mixed Trivia / Round X of Y / countdown 3-2-1".

Plan:

## Update RoundIntro to a randomized taunt screen

**File:** `src/pages/RoundIntro.tsx`

1. Replace the 3-second countdown with a **5-second display** (auto-advance to `/question`).
2. Remove the "Get Ready! / Mixed Trivia / Round X of Y" header and the visible 3-2-1 number.
3. Add a pool of ~10–15 randomized taunt messages, e.g.:
   - "Not bad. But it's about to get harder. Think you can keep up?"
   - "Decent start. The next round won't be so kind."
   - "You survived. Barely. Ready for worse?"
   - "Cute. Let's crank it up."
   - "Warm-up's over. Real questions now."
   - "Impressive… for a beginner. Bring it."
   - "You're doing fine. The questions aren't."
   - "Round X incoming. Hope you studied."
   - "Easy mode is over. Try not to embarrass yourself."
   - "Getting cocky? Let's fix that."
4. Pick one message at random on mount (`useMemo`).
5. Keep Enter = skip ahead, Esc = home.
6. Keep the round-start audio.
7. For **Round 1** (no prior performance to taunt about), show a different intro pool like "Here we go." / "Easy ones first." so the taunt makes sense.
8. Layout: single large centered message, primary color accent, subtle fade-in animation. No visible countdown — just auto-advance after 5s.

## Technical notes
- Use `useMemo(() => pickRandom(messages), [])` to lock the message for the screen's lifetime.
- Replace `setSecondsLeft` interval with a single `setTimeout(handleStart, 5000)`.
- Use `animate-fade-in` (already in tailwind config) for entrance.
- Branch message pool on `gameState.currentRound === 1` vs later rounds.

No other files need changes. Routing already lands on `/round-intro` between rounds (per last edit that skipped `/round-transition`).
