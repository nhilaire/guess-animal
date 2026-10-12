# Release: Devine l'Animal v0.1.0

Phone install: PASS
User acceptance: pending
Date: 2026-10-12
Commit: a202bcb
APK: guess-animal-0.1.0-arm64-v8a.apk (35.1 MB, arm64-v8a)
SHA-256: 00e7c4e37e9cce3347fe798d01152ab646aa314c0b5cd3a2d5fc1d55581c8646
Signature: release signature valid
Phone: Android 11 (API 30, arm64-v8a)
Launch check: alive after 10 s, no fatal error

## Notes from the user test

2026-10-12, first phone test (APK sha256 00e7c4e3…, commit a202bcb), not accepted yet. The user asked for:
- a more playful proposal: « J'ai trouvé ! C'est le chat ? » (victory title becomes « Je le savais ! »);
- a more playful home pitch: « Salut ! Je vais lire dans tes pensées. Pense à un animal… »;
- a bottom margin: the last button touches the Android navigation bar.
The user also asked why the cat took many questions. Simulation on the real data: the cat's consistent path takes
8 questions (a longer game comes from answers that differ from the data); lowering the proposal threshold to 0.70
saves under 1 question but drops right-first-time proposals from 90 % to 69 % with one wrong answer. The user chose
to keep 0.85. The cow was found in 8 questions.
