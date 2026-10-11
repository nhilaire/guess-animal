# Verification report: Devine l'Animal v0.1.0

Overall: PASS
Commit: d25e937
Date: 2026-10-11 20:18 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.1.0-universal.apk (79.3 MB)
SHA-256: d2cf74bbc1e69be93d368344490b979dbabbc59faf2fa0eb87233449a19813bf

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit d25e937 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       69 passed, 69 total |
| 4 | expo-doctor | PASS | all checks passed |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.1.0-universal.apk, 79.3 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | 715 ms (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 5/5 flows passed, 11 screenshots in screens/ |
| 12 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
