# Verification report: Devine l'Animal v0.2.0

Overall: PASS
Commit: 45c9810
Date: 2026-10-13 12:13 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.2.0-universal.apk (87.4 MB)
SHA-256: 6f41e80b57a28e5c944539686b57d8eb814a01e3a72a02ea4649f0ce050064d0

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 45c9810 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       97 passed, 97 total |
| 4 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.2.0-universal.apk, 87.4 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | 1089 ms (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 6/6 flows passed, 12 screenshots in screens/ |
| 12 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
