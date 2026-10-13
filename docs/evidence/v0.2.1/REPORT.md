# Verification report: Devine l'Animal v0.2.1

Overall: PASS
Commit: 9201093
Date: 2026-10-13 13:34 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.2.1-universal.apk (87.8 MB)
SHA-256: e745c4efd9a27e710b2977860759d7174c331046f7ea9ca6ede93d0bf804d4d7

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 9201093 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       98 passed, 98 total |
| 4 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.2.1-universal.apk, 87.8 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | 1900 ms (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 6/6 flows passed, 12 screenshots in screens/ |
| 12 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
