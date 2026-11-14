# Player ranks
- [x] Add persistent completion, personal-best, and streak rank rules with tests.
- [x] Show unlocked ranks and next milestones on the final score screen with remote navigation.
- [x] Verify the completed-game flow, persistence, and TV layout.

# AI topic trivia
- [ ] Add topic entry, balanced multiple-choice generation, answer review, and topic-game playback. Blocked: AI Gateway is enabled and its SDK installed, but this sandbox has no managed server credential; workspace model discovery and required model-type generation fail before inference. Restore managed AI Gateway access before implementing calls; never put a private key in browser code.

# Gameplay animation
- [x] Add answer-selection reactions, correct-answer motion, and shared round-completion celebrations.
- [x] Verify real answer feedback, stable arrows, unchanged progression, and reduced-motion behavior.

# Approved design refinements
- [x] Verify existing cumulative score with known correct answers.
- [x] Add fixed-anchor responsive answers, longer feedback, direct replay, previous scores, and readable rank tracks.
- [x] Add preload retry and save-failure recovery.
- [x] Verify timing rules, result history, remote flow, long-text geometry, and reduced motion.
- [ ] Verify Android TV emulator and real remote/couch-distance readability. Blocked: no native emulator or physical TV is available in this workspace.

# Native Android TV branding
- [x] Generate uploaded-artwork launcher densities, adaptive icon and TV banner resources.
- [x] Install resources and merge TV launcher declarations automatically after Android sync without replacing local native configuration.
- [x] Verify native resource installation, manifest preservation and repeat-sync behavior (four passing tests with real hosted PNGs).