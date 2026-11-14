# Smarty Couch — Design Review and Refinement Plan

## Verdict: 6.5 / 10

Preserve the minimal dark/purple TV identity. The central answer layout and single Play action are strong; improving readability and the shared-score replay loop matters more than adding decoration.

Reviewed the proposed shared-score spec against the current Home, intro, Question, Final Score, and Player Ranks screens. This review proposes changes; it does not implement them.

| Area | Score | Finding |
| --- | --- | --- |
| Home and entry | 8/10 | Clear title, short tagline, one focused Play action. Keep it. |
| Question hierarchy | 7/10 | Clean timer and score; question and answers could use stronger distance readability. |
| Answer feedback | 5/10 | Current 600 ms reveal is brief; color and motion carry too much of the result. |
| Final score and replay | 6/10 | Strong score hierarchy, but previous scores are invisible and Play Again returns Home. |
| Player ranks | 5/10 | Useful progression, but 12–14 px details are too small for couch reading. |
| Layout resilience | 6/10 | TV example fits; fixed answer widths do not adapt to smaller stages or long content. |

## What a 10 looks like

A group can read every answer from the couch, immediately understand a miss, see how this run compares with their best, and start another game with one remote press. Arrows never move with answer length. All essential content stays inside the TV-safe area. Progress is accessible without turning the final score into a dashboard.

## Evidence and limits

- Browser review at 1280×720 showed unclipped Home, intro, a real question, final score, and rank screens.
- Completed all three timed rounds using hosted questions. This run did not establish score correctness: three arbitrary guesses produced zero points. Do not treat this as proof of a scoring bug or a scoring pass.
- Activating Play Again returned to Home, matching the current source; it is not immediate replay.
- Rank names, requirements, and next-milestone lines render at 12–14 px.
- A short question fits, but answer tracks are fixed at 360 / 128 / 360 px plus gaps. Long-content fit remains unverified.
- The 411×770 Home screen fits inside a letterboxed 16:9 stage; phone gameplay remains unverified.
- Native TV, couch-distance readability, audio quality, and question-bank freshness were not verified.

## Priority 1 — Strengthen the question screen

- Keep hourglass and full-width reverse-draining timer at upper left, cumulative unlabeled score at upper right, purple category, then the question.
- Preserve plain answers without frames and the central arrows as the fixed anchor.
- Use bounded answer regions with reserved line space so longer text wraps without moving the arrows. Preserve approximately 32 px arrow-to-answer spacing at the reference TV size.
- Keep the current question size for short prompts; improve answer readability and long-text handling first rather than making all text larger.
- Raise the visibility of the arrow symbols without adding extra instructions or competing decoration.
- Pair correct/wrong color with a small non-color status mark outside the arrow region. Keep the selected wrong answer distinguishable from the revealed correct answer.
- Adopt the spec's proposed 1.2-second reveal only with explicit timing tests and score-history comparability handling. The round clock continues; accepted feedback finishes even if the clock expires.

## Priority 2 — Make the final score worth returning to

Retain the approved hierarchy:

1. Final Score.
2. Large cumulative score.
3. Current-run tier.
4. Best streak and earned bonus points / best category / worst category.
5. A compact personal-best comparison.
6. Play Again as the primary action; Progress and Home as secondary actions.

- Make Play Again start a fresh game directly; Home remains a distinct destination.
- Keep category positions stable when there is insufficient data. Show a neutral unavailable value rather than inventing a best/worst category or collapsing the whole row.
- Show streak bonus as earned bonus points, not an ambiguous second total score.
- Keep full history and rank details off the main result screen. Progress opens Scores and Ranks views with visible focus and predictable Back behavior.
- Scores shows up to ten previous completed runs, newest first, with a compact comparison to the current run. Do not invent dates for old records or claim population percentiles.
- Use a clear first-game state and a recoverable save-failure state.

## Priority 3 — Make ranks readable without expanding scope

- Replace the dense all-ranks overview with a large, remote-selectable track control: Games / Personal Best / Streak.
- Show four milestones for the selected track with larger names, readable requirements, and a prominent next milestone.
- Clearly distinguish this run's tier from lifetime unlocked ranks.
- Keep unlocked, locked, newly earned, and all-unlocked states visually distinct without relying solely on color.
- Reuse existing rank rules; add no new awards or thresholds.

## Preserve and defer

Preserve Home's single Play action, “Train your brain.”, automatic five-second intros, uploaded audio, subtle celebrations, existing rank thresholds, and reduced-motion behavior. Do not add settings, player selection, instructional text, a second countdown, new imagery, or new game modes. AI topic trivia remains outside this design refinement and still has its previously recorded access blocker.

## Technical implementation notes

- Reuse TVButton and semantic global tokens; remove raw purple utility exceptions in touched presentation code.
- Replace fixed answer tracks with responsive constraints while retaining a stable central control track. Define text sizes through explicit breakpoint steps, not viewport-scaled fonts.
- Share fresh-game initialization between Home and replay. Preserve question exclusions, completed-game identity, and lifetime history.
- Keep history/category summaries and timing rules testable outside presentation. History retention must allow ten previous scores after recording the current score.
- Handle preload errors in the intro with Retry and Home rather than silently returning Home. Keep the round timer stopped until questions are ready; add no separate loading page.
- Record structural decisions in AGENTS.md during implementation. No backend schema changes are assumed by this plan.

## Acceptance and delivery order

1. Validate existing scoring and result data with known correct/wrong answers before changing result presentation.
2. Implement safe answer regions and readable, unambiguous feedback.
3. Implement direct replay, personal-best comparison, and the separate score-history view.
4. Refine the rank view and missing-data/error states.
5. Verify 1280×720 and 1920×1080 with long questions/answers, fixed arrow coordinates, 5% overscan margins, remote focus, and reduced motion. Check phone gameplay separately without abandoning the TV-first stage.
6. Run focused tests for timing, replay initialization, category summaries, and history rules; complete a real three-round game and read the recorded result through the UI.
7. Treat Android TV emulator and real remote/couch-distance checks as release gates, retaining Java 17 compatibility.

Approval authorizes these refinements, not publishing or an APK build.
