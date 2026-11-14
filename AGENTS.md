# Architecture rules
- Keep rank thresholds and unlock evaluation in a pure utility so persistence and presentation share testable rules.
- Record completed-game rank progress by stable game identity, separately from legacy round-count statistics, to prevent duplicate unlock progress.
- Use CSS transform/opacity animations and a shared completion effect for gameplay feedback; motion must respect reduced-motion preferences and never control scoring or navigation timing.