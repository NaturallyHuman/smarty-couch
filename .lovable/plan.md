
User wants to simplify the Home screen:
1. Remove the disabled "Settings" button
2. Remove the player-mode selection step (Solo / Two Players / Back)
3. Tapping "Play" should start the game directly

Question: which mode by default? Looking at current code, solo and two-player both exist. User said "just start the game" — defaulting to **solo** is the safest assumption since it's the simpler/default experience and listed first. I'll go with solo and mention it so they can flip it if wrong.

## Plan

**File:** `src/pages/Home.tsx`

- Delete the `showModeSelect` state and the entire mode-select branch (Solo / Two Players / Back).
- Delete the `soloButtonRef` and the `useEffect` that focuses it.
- Delete the disabled "Settings" button.
- Keep only one centered "Play" button. Its `onClick` runs the existing `handlePlaySolo` logic directly (navigates to `/round-intro` with a fresh solo `GameState`).
- `handlePlayTwoPlayer` and its button are removed entirely.
- `playButtonRef` stays so D-pad focus lands on Play immediately.

Result: Home shows the title, tagline, and a single "Play" button → press it → game starts.

Note: defaulting to **solo** mode. If you want two-player as the default instead, say the word and I'll swap it.
