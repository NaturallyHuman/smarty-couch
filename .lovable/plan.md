
Three issues to address:

### 1. Audio not playing
Likely causes:
- `/question-music.mp3`, `/correct.mp3`, `/incorrect.mp3` files may not exist in `/public`
- Audio init lives inside `fetchQuestions` — only runs once, but autoplay can be blocked before user interaction

Fix: Verify files exist (will check during implementation). Move audio init to a separate effect that triggers on first user keypress/click as a fallback for autoplay policies. Also ensure music starts on Home/RoundIntro (post-user-interaction) so it's already "unlocked" by the time Question loads.

### 2. Move answers closer to arrows (~32px gap)
In `src/pages/Question.tsx` the D-pad layout currently positions answers at the outer edges with large gaps. Tighten:
- Top answer (A): position just above the up-arrow with ~32px gap
- Bottom answer (C): just below down-arrow with ~32px gap
- Left answer (B): just left of left-arrow with ~32px gap
- Right answer (D): just right of right-arrow with ~32px gap

Switch from `absolute` corner positioning to a layout anchored around the central D-pad, using fixed `gap` spacing of `32px` (e.g. `mr-8`/`ml-8`/`mb-8`/`mt-8`). Answer text widths shrink to fit naturally.

### 3. TimerBar should snap full on new question
In `src/components/TimerBar.tsx`, the bar uses `transition-all duration-1000 ease-linear`. When a new question loads and `timeRemaining` jumps from 0 → 10, it animates backward visibly.

Fix: Disable the transition when the bar is filling up (going from low to high), only animate when draining. Simplest: add a `key` reset or detect direction. Cleanest: have `Question.tsx` pass a `questionIndex` as `key` to `TimerBar`, forcing a remount per question so the fill state initializes instantly without transition. Alternatively, conditionally apply the transition class only when `percentage < previous percentage`.

### Files to edit
- `src/pages/Question.tsx` — tighten D-pad spacing (~32px), add `key={currentIndex}` to `TimerBar`, optionally add user-interaction audio unlock
- `src/components/TimerBar.tsx` — ensure first render shows full bar with no animation (mount = instant fill via initial style)
- `public/` — verify audio files exist; if missing, add fallback handling and surface an error

### Audio investigation step
Before implementing, confirm whether `/public/question-music.mp3`, `/public/correct.mp3`, `/public/incorrect.mp3` exist. If they don't, we need to either generate them or update paths. Will check `public/` directory first thing in implementation.
