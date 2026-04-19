
The top/bottom answers ("German proposal for Mexico to attack the US") wrap awkwardly because they're constrained to the center column (140px wide) of the D-pad grid. Left/right answers don't have this issue.

## Fix in `src/pages/Question.tsx`

**1. Let top/bottom answers span beyond the center column**
Currently the top (A) and bottom (C) answer cells are placed at `col-start-2` (the narrow 140px D-pad column). Move them to span all three columns so they can use the full row width:
- Top (A): `col-start-1 col-span-3` instead of `col-start-2`
- Bottom (C): `col-start-1 col-span-3` instead of `col-start-2`

This lets the text breathe horizontally and stay on a single line in most cases.

**2. Prevent unnecessary wrapping on all answers**
On the four AnswerChoice wrappers, swap `text-center`/`text-left`/`text-right` divs to allow inline behavior, and apply `whitespace-nowrap` to the button text in `src/components/AnswerChoice.tsx` only when text fits — but since some answers genuinely are long, use a softer approach:
- Add `whitespace-nowrap` to `AnswerChoice` button by default so short/medium text stays on one line.
- For very long answers that truly exceed available width, allow wrap by using `whitespace-nowrap` only at a min character threshold won't work cleanly in pure CSS. Simpler: keep `whitespace-nowrap` always — if text overflows the grid cell, it'll just push, but with the wider top/bottom row from change #1 this should rarely happen.

Refined approach: use `whitespace-normal` (default) but increase available width via #1, AND set `min-width: 0` isn't needed. The real fix is just #1 — giving top/bottom enough horizontal space. Adding `whitespace-nowrap` is a belt-and-suspenders for short answers.

**3. Keep grid alignment intact**
The center D-pad cell stays at `col-start-2 row-start-2`. Left/right answers stay in their columns. Only the top/bottom cells expand to span all 3 columns, but they remain visually centered (text-center) so they read as flanking the D-pad vertically.

## Files touched
- `src/pages/Question.tsx` — change `col-start-2` → `col-start-1 col-span-3` on top (row-start-1) and bottom (row-start-3) answer cells.
- `src/components/AnswerChoice.tsx` — add `whitespace-nowrap` to the button so short answers don't wrap when they don't need to. Long answers will still flow naturally because the wider span gives them room.

No logic changes. No layout regressions for left/right answers.
