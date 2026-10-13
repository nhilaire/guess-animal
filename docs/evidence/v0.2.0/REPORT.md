# Verification report: Devine l'Animal v0.2.0

Overall: PASS
Commit: 2cb0b6d
Date: 2026-10-13 05:57 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.2.0-universal.apk (87.4 MB)
SHA-256: 82ceb570f7c95bacefa6999055300c678da3c0f357d620b3473cc030ea2071f1

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 2cb0b6d |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       95 passed, 95 total |
| 4 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.2.0-universal.apk, 87.4 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | 777 ms (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 6/6 flows passed, 12 screenshots in screens/ |
| 12 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
