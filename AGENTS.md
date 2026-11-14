# Architecture rules
- Keep rank thresholds and unlock evaluation in a pure utility so persistence and presentation share testable rules.
- Record completed-game rank progress by stable game identity, separately from legacy round-count statistics, to prevent duplicate unlock progress.
- Use CSS transform/opacity animations and a shared completion effect for gameplay feedback; motion must respect reduced-motion preferences and never control scoring or navigation timing.
- Share fresh-game initialization between entry and replay so identity and solo defaults cannot diverge.
- Store eleven versioned completed-score records to show ten previous runs separately from the current run without erasing legacy scores.
- Keep reveal deadlines and answer-acceptance rules separate from decorative motion so pause and expiry cannot rescore or truncate accepted feedback.
- Use a responsive fixed-anchor answer grid and separate score/rank progress views to preserve TV-safe geometry and a concise result screen.