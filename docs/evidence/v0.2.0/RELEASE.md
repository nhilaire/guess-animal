# Release: Devine l'Animal v0.2.0

Phone install: PASS
User acceptance: confirmed (2026-10-13)
Date: 2026-10-13
Commit: 3c23197
APK: guess-animal-0.2.0-arm64-v8a.apk (40.4 MB, arm64-v8a)
SHA-256: 4da51cc3ef2c6f1fe0398fbed8579fe8750fae9b3ecbbf4fe310063a72cc124e
Signature: release signature valid
Phone: Android 11 (API 30, arm64-v8a)
Launch check: alive after 10 s, no fatal error

## Notes from the user test

2026-10-13, phone tests of v0.2.0:
- first build: the user saw several animals proposed in a row (coq → moineau → flamant rose). Fixed: at least 3
  questions after a wrong proposal, question cap +5 per miss, answer likelihood 0.90, 117 trap facts set to variable.
- second build: the user liked it but wanted more random questions. Fixed: draw among the 6 best questions within
  50 % of the best.
- third build (arm64 APK sha256 4da51cc3…, commit 3c23197): the user played it, including new animals, and accepted
  version 0.2.0. This phone test also replaces the sheet review of the new animals (user decision, AC-29).
