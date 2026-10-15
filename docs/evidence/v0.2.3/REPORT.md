# Verification report: Devine l'Animal v0.2.3

Overall: PASS
Commit: e65ba46
Date: 2026-10-15 14:12 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.2.3-universal.apk (87.8 MB)
SHA-256: 8afcb3fd4c5aee764f171c5759c2fd559ef0a94c31842328a4651ee0dfa4dbad

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit e65ba46 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       99 passed, 99 total |
| 4 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.2.3-universal.apk, 87.8 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | median 1419 ms of 1419 / 1389 / 1567 ms after a warm-up launch (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 7/7 flows passed, 16 screenshots in screens/ |
| 12 | no crash during e2e flows | PASS | 0 fatal log lines (crash buffer + errors, raw/logcat-e2e.txt) |
| 13 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
