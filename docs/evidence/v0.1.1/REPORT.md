# Verification report: Devine l'Animal v0.1.1

Overall: PASS
Commit: ed5577a
Date: 2026-10-12 17:51 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.1.1-universal.apk (81.3 MB)
SHA-256: 090b7222ebd8b943662c2beeb37746b72e21ffa51fdccb34dac9edcb8a49db4e

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit ed5577a |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       69 passed, 69 total |
| 4 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.1.1-universal.apk, 81.3 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | 2084 ms (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 5/5 flows passed, 11 screenshots in screens/ |
| 12 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
