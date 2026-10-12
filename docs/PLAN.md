# Plan: Devine l'Animal v0.1.0

Each task is small (one commit), references the acceptance criteria it serves, and names its proof.
Format: `- [ ] T-01 Title (AC-01, AC-02) - proof: unit|e2e|device`. Check the box only when the proof passes.

## Tasks

- [x] T-01 Inference engine: weights, likelihoods, information gain, proposal rule, wrong proposals, give up, undo (AC-06, AC-07, AC-08, AC-09, AC-10) - proof: unit
- [x] T-02 Question list and data pipeline: data/questions.csv + data/animals.csv -> src/game/data.generated.ts, validation (AC-03, AC-05) - proof: unit
- [x] T-03 Animal data: ~150 animals with every fact, distinguishability and generic-name checks (AC-03, AC-04, AC-05) - proof: unit
- [x] T-04 Simulation tests on the real data: perfect player and one-wrong-answer player, tune data until targets pass (AC-11, AC-12) - proof: unit
- [x] T-05 Data review sheet docs/DATA-REVIEW.md generated from the CSV, French, per animal (AC-29) - proof: unit
- [x] T-06 French copy in tu form with no-break spaces, typography test over fr.ts and questions (AC-01, AC-27) - proof: unit
- [x] T-07 Screens: consent (French), home, question, proposal, victory, give up, thanks; navigation and Android back (AC-01, AC-02, AC-14, AC-15, AC-16, AC-17, AC-25) - proof: unit
- [x] T-08 Settings: sound, vibrations, anonymous statistics, persisted (AC-18, AC-21) - proof: unit
- [x] T-09 Telemetry calls: game_start, game_end (found / given_up / quit), animal_missed (AC-20, AC-21) - proof: unit
- [x] T-10 Voice samples with 3 French Azure voices for the user to choose (AC-28) - proof: manual
- [x] T-11 Audio generation script (Azure Speech REST) + manifest, all audio files generated and committed (AC-13, AC-27) - proof: unit
- [x] T-12 Audio playback with expo-audio: auto-play, replay, stop on answer, sound toggle; sound effects and haptics (AC-19, AC-26) - proof: unit
- [x] T-13 Maestro flows: smoke (consent refuse + relaunch), find the lion (generated from data), give up after 3 wrong proposals, undo, settings persistence, telemetry consent (AC-01, AC-02, AC-14, AC-15, AC-16, AC-17, AC-18, AC-22, AC-23, AC-24) - proof: e2e
- [x] T-14 Release checks prepared: no RECORD_AUDIO / AD_ID, offline flows, cold start, final app label (AC-22, AC-23, AC-24, AC-30) - proof: device
- [x] T-15 v0.1.1 copy: victory « Youpi, je suis trop fort ! », give up « Bravo, tu es très fort ! » (text, voice clips, tests, flows) (AC-13, AC-15, AC-16, AC-27) - proof: unit

## Notes

- Engine first (T-01) with a tiny fixture dataset, so the rules are proved independently of the real data.
- Data (T-03) is the main risk: accuracy and distinguishability. The validation and simulation tests drive it;
  ambiguous facts are marked `v` (variable) rather than guessed. The user reviews a sample (AC-29) before release.
- `Manchot`: French children often say « pingouin » for it; only « Manchot » is kept (no duplicate), its review row
  says so.
- Voice (T-10, T-11): a Node script (no dependency) calls the Azure Speech REST API with the key from user
  environment variables; only public game texts are sent. Generated MP3 files are committed; the app never calls it.
- Sound effects are synthesised by a local script (self-made, no licence issue), recorded in `assets/LICENSES.md`.
- E2E "find the lion" flow is generated from the data (one conditional step per question), so it stays in sync.
- AC-22, AC-23, AC-24 are proved by `/verify-app` (device); AC-28, AC-29, AC-30 need the user.
- AC-28 proof (2026-10-11): `node scripts/tts.mjs --samples` generated the same sentences with fr-FR-DeniseNeural,
  EloiseNeural, HenriNeural and VivienneMultilingualNeural; the user listened and chose **fr-FR-DeniseNeural**.
