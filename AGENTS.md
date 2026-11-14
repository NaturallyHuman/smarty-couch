# Architecture rules
- Keep rank thresholds and unlock evaluation in a pure utility so persistence and presentation share testable rules.
- Record completed-game rank progress by stable game identity, separately from legacy round-count statistics, to prevent duplicate unlock progress.