# Verification report: Devine l'Animal v0.2.2

Overall: PASS
Commit: 505d591
Date: 2026-10-13 15:32 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.2.2-universal.apk (87.8 MB)
SHA-256: ac9b40197554fab12c78e85e4bfc3c5b43b8c7768c250cfe5e473929ff7bbee9

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 505d591 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       98 passed, 98 total |
| 4 | expo-doctor | PASS | all checks passed |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.2.2-universal.apk, 87.8 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | 1236 ms (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 6/6 flows passed, 14 screenshots in screens/ |
| 12 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
