# Smarty Couch — Design Consultation

## Resolved direction

**Crisp game show, built for the couch.** Retain the purple identity, introduce Sora headings and Manrope body text, and refine results and ranks without rearranging gameplay.

The design should feel confident and playful through typography and clear progress—not extra decoration. Keep the uploaded icon and audio unchanged.

## Palette and visual roles

Preserve existing semantic colors rather than replacing them with new palette approximations:
- Background: near-black charcoal.
- Primary: current purple for scores, selected controls, and category titles.
- Foreground: near-white for essential text.
- Muted: readable gray for supporting information.
- Amber: bonus points and newly unlocked achievements.
- Green/red: correct and incorrect states, always accompanied by a non-color cue.

Keep focus distinct from selection: a high-contrast outline identifies the remote's current target; a purple fill identifies the active view. Avoid giving several unrelated controls the same visual emphasis.

## Typography

- **Sora, 600–700:** title, final score, current-run tier, rank names, major section headings.
- **Manrope, 500–700:** answers, category names, statistics, requirements, dates, and action labels.
- Use tabular numerals for scores and counts; zero letter spacing.
- At the 1280×720 reference size: final score approximately 72 px, tier 30 px, category/rank values 24 px, supporting TV text 18 px. Preserve the existing question size and reserved text regions.
- Use explicit size steps for larger TVs and smaller stages. Validate the longer font metrics before claiming the TV-safe fit is preserved.
- Load fonts locally so the installed Android app can display them without fetching font files at launch.

## Final score arrangement

Keep the approved centered sequence:

1. Final Score label.
2. Large purple cumulative score.
3. Current-run tier.
4. Three equal columns: best streak and bonus points / best category / worst category.
5. Compact personal-best comparison and, when earned, a small unlock notice.
6. Play Again primary; Progress and Home secondary.

Use consistent column baselines and reserved space for absent category data. No cards around the overall section. Avoid letting celebration pieces obscure essential numbers or labels.

Keep this run's tier clearly separate from lifetime rank achievements. Do not add a population percentile or another score formula.

## Progress and ranks

- Scores and Ranks remain two views inside Progress, not extra result-screen content.
- Visually separate the view selector from the Games / Personal Best / Streak track selector. Use a restrained underlined view selector and stronger segmented track selection so the two levels do not compete.
- In Ranks, lead with the selected track's lifetime value and next milestone. Keep four milestones in an unframed two-column layout with larger names and readable requirements.
- Preserve check/lock indicators and a restrained New accent. Selection must not be confused with an earned achievement.
- In Scores, retain the two-column list of ten previous runs with consistent numeric alignment. Put any earlier-timing distinction in supporting text, not in a loud repeated amber label on every row.
- Keep the action row stationary between progress views where the safe area allows it. Back returns to Final Score; Play Again stays directly available.

## Controls and motion

Use existing TV controls with at most 8 px corners and a clearly visible remote focus ring. Keep action labels readable, with Play Again the only dominant action.

Reuse subtle transform/opacity effects; do not add a new animation system. Reduced-motion presentation remains static with identical answer timing. Decorative movement never drives scoring or navigation.

## Scope

This is a visual refinement, not a scoring, timing, question-bank, rank-threshold, account, or native-icon change. Preserve the 16:9 stage, 5% safe margins, fixed arrow anchor, immediate answers, uploaded audio, direct replay, and score history.

## Technical implementation

- Store local font files through the asset-pointer flow and define reusable heading/body font tokens in global CSS. Apply typography roles centrally rather than duplicating font styling across screens.
- Refine GameOver and PlayerRanks presentation; preserve pure rank/history/category utilities and existing stored records.
- Adjust existing TV control variants for focus and active-view distinctions rather than introducing unrelated controls.
- Keep dimensions responsive through bounded tracks and explicit breakpoints; do not use viewport-scaled font sizes.
- Record any new structural font/control conventions in AGENTS.md during implementation.

## Verification

Check real completed-game results, first-game/insufficient-category states, ten-score history, unlocked/locked/all-unlocked ranks, and remote focus across views. Verify 1280×720, 1920×1080, and the current phone viewport with long labels and reduced motion. Run existing logic tests to ensure the visual changes do not affect scoring or persistence.

Physical-TV couch-distance readability remains a local device check. This plan does not publish the app or build an APK.