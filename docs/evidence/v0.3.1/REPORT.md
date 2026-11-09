# Verification report: Devine l'Animal v0.3.1

Overall: PASS
Commit: c7be5d9
Date: 2026-11-09 07:12 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.3.1-universal.apk (92.8 MB)
SHA-256: de3e406a28e3cd6dfe954be06bcd1d4762e86335191e789f8f54064f45327bb6

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit c7be5d9 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | lint | WARN | no "lint" script in package.json (app scaffolded before ESLint was part of the overlay) |
| 4 | unit tests (Jest) | PASS | Tests:       133 passed, 133 total |
| 5 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 6 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 7 | release build | PASS | guess-animal-0.3.1-universal.apk, 92.8 MB, Firebase on |
| 8 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 9 | install (adb) | PASS | Performing Streamed Install Success |
| 10 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 11 | cold start time | PASS | median 590 ms of 612 / 514 / 590 ms after a warm-up launch (target < 3000 ms) |
| 12 | Maestro E2E flows | PASS | 8/8 flows passed, 20 screenshots in screens/ |
| 13 | no crash during e2e flows | PASS | 0 fatal log lines (crash buffer + errors, raw/logcat-e2e.txt) |
| 14 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
