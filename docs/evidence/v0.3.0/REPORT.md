# Verification report: Devine l'Animal v0.3.0

Overall: PASS
Commit: 55bb461
Date: 2026-10-26 12:05 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: guess-animal-0.3.0-universal.apk (92.8 MB)
SHA-256: 7a7c9babd4b278962c19a4ba9c84e504c0d4f3692ac3fc24c851a3ff06f43739

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 55bb461 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       123 passed, 123 total |
| 4 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | guess-animal-0.3.0-universal.apk, 92.8 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | median 1368 ms of 1151 / 1368 / 1711 ms after a warm-up launch (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 8/8 flows passed, 20 screenshots in screens/ |
| 12 | no crash during e2e flows | PASS | 0 fatal log lines (crash buffer + errors, raw/logcat-e2e.txt) |
| 13 | telemetry events after consent | PASS | seen in logcat: game_start, game_end |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
