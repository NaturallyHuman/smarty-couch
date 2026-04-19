
Big update — five connected changes. Here's the plan.

## 1. Streak bonus scoring (escalating)

Replace the current scoring (base + timer + flat streak multiplier) with a simpler, escalating model the user described:

- Every correct answer = **100 points** (base).
- Streak bonuses kick in at **3 in a row** and grow each additional correct answer:
  - 3-in-a-row: +50
  - 4-in-a-row: +100
  - 5-in-a-row: +200
  - 6-in-a-row: +400
  - 7+: +800 (caps to keep numbers sane)
- Wrong answer / timeout resets the streak to 0.
- Drop the timer bonus (no per-question timer anymore — see #2).

File: `src/utils/scoring.ts` — rewrite `calculateScore` with the new schedule.

## 2. One-minute round (answer as many as you can)

Each round becomes a **60-second sprint**. Players answer questions back-to-back; the round ends when the timer hits zero, not after N questions.

Changes in `src/pages/Question.tsx`:
- Replace per-question timer (`QUESTION_TIME = 10`) with a single round-level timer (`ROUND_TIME = 60`).
- Remove `QUESTIONS_PER_ROUND = 10`. Instead, fetch a large pool (e.g. 30) up front so we never run out mid-round, and just keep advancing through them.
- Timer bar (`TimerBar`) reflects the **round** countdown, not the question. It starts full at the beginning of the round and drains continuously across questions — no reset between questions.
- When the player answers (correct or wrong), show feedback briefly (~600ms — shorter than today's 1200ms so the sprint feels snappy) then auto-advance to the next question.
- Wrong answer no longer ends the question with a long pause; just flash red, reset streak, move on.
- When the 60s timer hits zero, end the round (same flow as today's "last question answered").
- Remove the per-question timeout logic; the round timer handles end-of-round.

`TimerBar` already accepts `timeRemaining` / `maxTime` and animates smoothly — we just feed it the round timer and stop using `key={currentIndex}` (which currently forces a reset between questions).

## 3. Category breakdown on results screen

End-of-game screen needs a per-category breakdown plus strongest/weakest highlighted.

- Track per-category **correct + attempted** during the round (we already track `correctByCategory`; add an `attemptedByCategory` counter alongside it).
- Pass both into `GameOver` (or a new results screen) via `gameState` / location state.
- Render a list:
  - Each category: correct / attempted (e.g. "Movies — 4 / 6, 67%")
  - Highlight the strongest (highest accuracy, min 2 attempts) in green
  - Highlight the weakest in red

File: `src/pages/GameOver.tsx` — expand layout to include the breakdown section.

## 4. Last 10 scores history

Persist a rolling list of the player's last 10 game scores so they can compare.

- Extend `LifetimeStats` in `src/types/game.ts`: add `recentScores: number[]` (newest first, max length 10).
- Update `src/utils/lifetimeStats.ts` so `updateLifetimeStats` (or a new `recordGameScore`) prepends the new total and trims to 10.
- On `GameOver`, show a small list/bar chart of the last 10 scores. The current game's score is highlighted. Above/below average is visually obvious (e.g. taller bars = higher score).

## 5. Random silly awards

At game end, award the player 1–3 randomly chosen humorous "achievements" based on their actual play data, plus pure-random gag awards.

New file: `src/utils/awards.ts` exporting a list like:

- "🛋️ Couch Potato Champion" — always eligible
- "🐢 Slow and Steady" — answered fewer than 8 questions
- "⚡ Caffeinated" — answered 20+ questions
- "🎯 Sniper" — accuracy ≥ 80%
- "🎲 Lucky Guesser" — accuracy 25–40%
- "🔥 On Fire" — max streak ≥ 5
- "🧊 Ice Cold" — got 3 wrong in a row at any point
- "🦉 Night Owl" — played after 10pm local time
- "🎭 Drama Queen" — finished with a wrong answer
- "🏆 Self-Proclaimed Genius" — score above their personal best
- Plus pure-gag random ones: "🐸 Frog Whisperer", "🥔 Mashed Potato Enthusiast", "👑 King of the Remote", "🛸 Probably an Alien"

Pick 2–3 to display on `GameOver`. Mix one earned (based on stats) + one random gag for variety.

## Files touched

- `src/types/game.ts` — add `recentScores`, `attemptedByCategory`, simplify `RoundResult` if needed
- `src/utils/scoring.ts` — new escalating streak schedule, drop timer bonus
- `src/utils/lifetimeStats.ts` — record recent scores
- `src/utils/awards.ts` — **new**, award pool + picker
- `src/pages/Question.tsx` — round-level 60s timer, no per-question count cap, faster feedback, track attempted-by-category
- `src/pages/GameOver.tsx` — category breakdown, strongest/weakest, last-10-scores chart, silly awards
- `src/components/TimerBar.tsx` — minor: ensure it animates smoothly across the full minute (no key reset)

## Notes / decisions made

- **Default mode is solo** (per recent change). The new GameOver layout is designed for solo; two-player mode still works but shows one combined breakdown — we can split it later if you ever bring two-player back to the main flow.
- **Round count**: with 60-second rounds, keeping 3 rounds total means ~3 minutes of play. That feels right. If you want fewer/more rounds, easy to tweak.
- **Difficulty still escalates per round** (easy → medium → hard) via existing `getDifficultyForRound`. No change there.
