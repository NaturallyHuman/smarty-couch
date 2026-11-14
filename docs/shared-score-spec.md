# Smarty Couch: Shared-Score Replayability Spec

Status: proposed implementation specification. This document changes no gameplay.

## Product brief

For people who enjoy intellectual challenges, Smarty Couch is quick, low-commitment TV entertainment: brainstorm answers together, earn one shared score, and try to beat it next time.

Protect the existing simple flow and dark/purple visual hierarchy. Prioritize fresh questions, trustworthy score comparison, and readable answer feedback before adding score-level unlocks. No accounts, individual players, online competition, new modes, or social features in this scope.

## Evidence and current gaps

- The builder has played with groups who enjoy discussing answers and chasing a shared score. Unprompted repeat visits are not yet established.
- The current flow starts one three-round game; rounds use 60 seconds and easy → medium → hard difficulty. Earlier ten-question requirements are superseded for this spec by the later timed-sprint request.
- Answer feedback currently lasts 600 ms, which the builder finds too fast.
- The selector marks the entire preloaded pool as used, resets history when supply is insufficient, and samples a limited query before shuffling. These behaviors can undermine freshness and category variety. Live question inventory has not been audited for this spec.
- Ten recent scores are stored but not shown on the final screen. Recording is guarded only for the current screen mount, not by a durable game identity.
- The final screen displays a tier name, but not the ladder or persistent unlocks. Both Play Again and Home currently go home.

## User stories

1. As a couch group, we want varied, unfamiliar questions so another attempt feels worthwhile.
2. As a group, we want enough time to see the correct answer after a guess so we can react and learn.
3. As a returning group, we want our previous ten completed scores and personal best so our progress is tangible.
4. As a group improving our score, we want visible score levels and persistent unlocks so achievements feel earned.
5. As TV players, we want one-button replay and stable remote navigation without extra setup.

## Phase 1 — Lock down scoring and completed-game records

**Build:** create a unique identity when starting a game; aggregate each round exactly once and save each completed game exactly once. Preserve cumulative score across rounds. Keep attempts, correct answers, category counts, best streak, and streak-bonus totals consistent with the accepted answers.

**Acceptance checks**
- Every correct answer earns 100 base points. Bonuses on consecutive correct answers are 3: +50, 4: +100, 5: +200, 6: +400, and 7+: +800, preserving the existing schedule.
- Three consecutive correct answers produce 350 total points. A wrong answer afterward leaves 350 points and resets the streak; the next correct answer produces 450 points with no streak bonus.
- Wrong answers never subtract earned score or earned bonus totals. No per-answer speed bonus is introduced.
- A 350-point first round followed by a 200-point second round shows 550 cumulatively. Each round contributes its delta once, including at timer expiry.
- Preserve the current streak reset between rounds; the best streak and earned bonus totals persist across the game.
- Answer acceptance closes when round time expires. An answer accepted before expiry counts once; one accepted at or after expiry does not count.
- Reopening the same completed game does not add a duplicate score or increment games played again. Quitting an incomplete game does not create a completed-score entry.
- Existing numeric score history migrates without loss; new records add game identity and completion time. Invalid storage falls back safely; unavailable storage leaves gameplay usable and communicates that results could not be saved.

## Phase 2 — Make the question bank genuinely fresh and mixed

**Build:** audit the hosted inventory by category and difficulty; review question quality and expand shortages. Replace random-sort shuffling with an unbiased shuffle, preserve answer identity when moving choices, and construct mixed-category pools rather than relying on database row order.

**Acceptance checks**
- Each round uses its intended difficulty: easy, medium, then hard. No silent downgrade to easier questions.
- The first five questions include at least three categories when eligible inventory supports it; do not show more than two consecutive questions from one category when alternatives exist.
- Answer locations and question order vary; the correct answer remains correct after every shuffle, using original choice indices rather than matching answer text.
- No displayed question repeats within a game. Track displayed IDs separately from preload reservations; unused prefetched questions are not permanently consumed.
- Questions displayed in the previous ten completed games on this device are excluded. Also retain displayed IDs from an interrupted game until they age out with the next ten completed games.
- Insufficient inventory never silently clears recent history. Expand the bank before release; if exhaustion still occurs, show a recoverable unavailable state rather than serve a protected repeat.
- Preload during the existing five-second intro. Refill the round pool without duplicates before exhaustion instead of ending a round because its initial 30 questions ran out.
- Loading failures allow retry or Home; the round timer does not begin before playable questions are ready.

**Capacity gate:** the old 300-question guarantee is inadequate for variable-length sprint rounds. At a 1.2-second feedback minimum, an almost-instant-answer player can consume roughly 50 questions per difficulty per game. Ten-game protection requires at least 500 reviewed questions per difficulty, plus enough eligible questions for the next game and category balance. Calculate the final launch inventory from the implemented maximum throughput, with headroom; do not promise ten-game freshness before the inventory audit and exhaustion tests pass.

## Phase 3 — Give answers room to land

**Build:** increase the answer reveal to a proposed 1.2 seconds, returning to the earlier feedback duration. Clearly distinguish the selected wrong answer from the correct answer, then advance automatically. Preserve seamless background music and the uploaded sound effects.

**Acceptance checks**
- A correct or incorrect answer remains visible for 1,200 ms before the next question; further input during that reveal is ignored.
- The 60-second round clock continues during feedback, preserving the sprint and comparable scores. Pausing the round clock on every answer is explicitly out of scope.
- If time expires during feedback, scoring closes immediately, but the accepted answer's reveal finishes before transitioning; no new question opens.
- Pause freezes both remaining round time and remaining reveal duration. Resume continues them without replaying or rescoring an answer.
- Holding an arrow does not answer the next question through key-repeat events. Up=A, Left=B, Down=C, Right=D remain immediate-submit controls.
- The arrows stay fixed as the page anchor with both short and long answers. Preserve the approximately 32px answer-to-arrow spacing at the reference TV size, scaling safely at smaller sizes.
- All content fits a 16:9 stage within 5% safe margins at 1280×720 and 1920×1080. Phone testing remains usable without changing the TV-first layout intent.
- Existing five-second inter-round messages remain automatic; no second countdown or confirmation screen is added. Reduced-motion users get the same readable timing without decorative movement.

**Trade-off:** a longer reveal reduces the number of possible answers in a minute. Keep historical scores visible, but tag new records with a rules version and do not imply old scores earned under different timing are directly comparable. Do not erase old personal bests.

## Phase 4 — Make progress visible without a bulky final screen

**Build:** retain Final Score → large cumulative score → tier → best streak / best category / worst category. Add a compact tier ladder and a remote-accessible score-history view, not an overloaded single screen. Keep Play Again and Home distinct.

**Acceptance checks**
- Use the existing tier thresholds: Warm-Up 0, Sharp Guess 1,500, Quick Thinker 3,000, Fact Machine 5,000, Trivia Titan 8,000. Crossing a threshold unlocks that level once; previously earned levels remain unlocked after a lower score.
- Show the current run's tier separately from lifetime unlocked levels. Show exact points to the next level; at 3,000 points show Quick Thinker and 2,000 points to Fact Machine. At 8,000 or above there is no next-level deficit.
- History shows up to ten completed scores preceding the current game, newest first, with dates where known. Keep the current score separate; retain enough records to display ten previous runs after saving the current one.
- Show the previous personal best and whether this run beat it. Tying a personal best is not labeled a new record.
- Empty history is a clear first-game state. Legacy entries without dates remain visible without invented dates. Label older rules versions where timing differs.
- Best and worst category values derive from correct/attempted counts, never score. Preserve the existing minimum of two attempts to rank a category; when fewer than two categories qualify, do not invent a worst category. Resolve ties deterministically.
- Play Again starts a fresh game directly, retaining history and question exclusions. Home returns to the title screen. Remote focus starts on Play Again; arrows move among actions and Enter activates only the focused action.
- Earned level awards are deterministic and persistent. Random humorous awards, additional animation systems, and new threshold balancing are deferred until the core loop is validated.

## Phase 5 — Verify and release the shared-score loop

**Build:** add focused logic tests and browser-flow coverage; verify on an Android TV emulator and a real remote before release. The repository currently has no test command, so introduce one with the implementation rather than claiming existing coverage.

**Acceptance checks**
- Tests cover each scoring threshold, wrong-answer retention, round aggregation, expiry boundaries, pause/reveal timing, duplicate completion, history retention, each rank boundary, shuffle correctness, mixed categories, and protected-question exhaustion.
- A real hosted-question playthrough completes all three rounds, records a nonzero score and correct category counts, reveals history through the UI, and starts replay without returning to mode selection.
- Across ten completed test games and the start of the eleventh, observed IDs satisfy the freshness window; test both normal and maximum-throughput input, plus an interrupted game.
- Verify remote focus, held-key behavior, 5% margins, long question/answer text, smooth audio, retries, and persistence after restart. Source inspection alone is not acceptance evidence.
- Run the project's automated checks; build Android with Java 17 compatibility retained. Native install and real-TV checks remain explicit release gates, not inferred from a web preview.
- Invite the groups who have already tried the game to play without prompting. Observe whether they choose another run and later return to beat their shared score. Repeat demand remains a hypothesis until observed.

## Technical implementation notes

- Keep React/Vite and the existing TVButton/design tokens; preserve the active solo/shared-score flow rather than implementing dormant competitive routes.
- Separate pure scoring, rank, category-summary, and history rules from screen effects so concrete values can be tested. Use one idempotent round-finalization path and one idempotent game-recording path.
- Store versioned device-local completed-game records and displayed-question history. No account requirement or cross-device synchronization in this scope.
- Keep question retrieval in the existing Lovable Cloud database; inspect hosted inventory before proposing exact seed counts. Any schema or permission change requires the platform's schema guidance and explicit access controls.
- Use cancellable preloads/refills with distinct reserved and displayed IDs. Ensure duplicate requests or aborted intros cannot consume questions or start the round twice.
- Keep the existing shared audio manager and user-provided audio files. Do not regenerate or replace those assets.

## Delivery order and scope boundary

Implement and verify phases in order: trustworthy records → fresh content → readable feedback → visible progression → end-to-end release checks. Rank presentation must not ship ahead of correct scoring and usable comparison.

This spec does not implement code, seed questions, alter the north star, publish the app, or produce an APK. Inventory quantities and device performance are release checks still to be measured; 1.2-second feedback is a proposed default, not an already-validated preference.