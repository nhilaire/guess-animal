# Brief: guess-animal

Date: 2026-10-11
Project slug: guess-animal
Final app name: Devine l'Animal

## Original brief

Il s'agit d'un jeu où on doit choisir un animal et le jeu pose des questions jusqu'à arriver à identifier l'animal en question. Il y a une première version ici dont on peut s'inspirer C:\dev\DevineAnimal mais il faut sans doute revoir l'algorithme et surtout être certain des questions et des animaux. Public familial. La question est posée à l'écrit et à l'oral, et on peut répondre par oui, non, je ne sais pas

## Clarifying questions

Answers are summarised in English. Format: `- **Q:** question` then `  **A:** answer`.
Mark assumptions the user accepted as `(default accepted)`.

### Concept and players

- **Q:** How many animals should the game know?
  **A:** About 150 animals, with no generic duplicates (no "Fish" or "Monkey" next to specific species); every animal/question answer must be verified.
- **Q:** How are the questions and the animal facts made trustworthy?
  **A:** A human-readable data file (spreadsheet-like), automated tests proving every animal is reachable and distinguishable, plus a review by the user of a sample (default accepted).

### Gameplay and controls

- **Q:** Which answers can the player give?
  **A:** Yes / No / I don't know (default accepted). "I don't know" eliminates no animal.
- **Q:** How does the player answer?
  **A:** Large touch buttons only; no speech recognition, no microphone permission (default accepted).
- **Q:** With only Yes/No, how are ambiguous facts handled (e.g. "lives on a farm?" for a dog)?
  **A:** Error-tolerant guessing: each fact is stored as yes / no / variable; a contradicting answer penalises an animal instead of eliminating it, so one wrong answer does not ruin the game (default accepted).
- **Q:** Maximum number of questions per game?
  **A:** About 20 (2-3 minute game); the game proposes as soon as it is confident enough, often around 10-15 questions (default accepted).

### Progression, scoring, difficulty

- **Q:** What happens when the game proposes the wrong animal?
  **A:** It discards that animal and keeps asking; after 3 wrong proposals it gives up and asks the player to pick the animal they had in mind from the list (used to measure gaps) (default accepted).

### Look, sound and feel

- **Q:** How are questions read aloud?
  **A:** Pre-generated audio files made with the free Microsoft Edge online "Read aloud" neural voices (e.g. the edge-tts tool: no account, no key), bundled in the APK so the game plays offline; generated audio files are committed. (Changed by the user after discovery: Edge instead of Azure Speech.) (Superseded by the amendment of 2026-10-11: Azure Speech is used instead.)
- **Q:** What is shown when the game proposes an animal?
  **A:** Emoji + name (default accepted); animals without an emoji get a generic pictogram. No copyrighted images.
- **Q:** Which voice?
  **A:** Female voice fr-FR-DeniseNeural (default accepted); samples to be compared before generating everything.
- **Q:** Which sounds besides the voice?
  **A:** Small sound effects (win / give-up) and short haptics on key events; no background music; a mute toggle (default accepted).

### Screens and settings

- **Q:** Tu or vous?
  **A:** Tu (default accepted).
- **Q:** Which extra controls and screens?
  **A:** A "listen again" button that replays the question, and an "undo" button that corrects the last answer. No list-of-animals screen and no end-of-game recap in v0.1 (the full list appears only when the game gives up).

### Telemetry and success metrics

- **Q:** What does success mean (anonymous, opt-in statistics)?
  **A:** Guess success rate and number of questions needed; which animals the game fails to find (to fix the data); number of games played and app opens.

### Constraints

- **Q:** What is out of scope for v0.1?
  **A:** Learning new animals, languages other than French, speech recognition, multiplayer / leaderboards / accounts (all defaults accepted).
- **Q:** Must it work offline?
  **A:** Yes: all audio is bundled; the only network use is opt-in telemetry (default accepted).

## Decisions taken during discovery

- The first version (C:\dev\DevineAnimal, ~118 animals, 31 questions, random question order) is inspiration only: algorithm and data are rebuilt.
- Algorithm: pick at each step the question that best splits the remaining candidates (information gain), with soft scoring so a wrong or variable answer penalises rather than eliminates; propose when one animal clearly leads or after ~20 questions; after a wrong proposal discard it and continue; give up after 3 wrong proposals.
- Data: ~150 well-known animals, no generic duplicates; each fact is yes / no / variable; one readable source data file; automated tests prove every animal is reachable and distinguishable from every other; the user reviews a sample before release.
- Answers: Yes / No / I don't know, large touch buttons, no microphone.
- Voice: questions, proposals and fixed sentences pre-generated with the free Microsoft Edge online neural voices (fr-FR-DeniseNeural), via a local generation script (not run by the app); no account and no key needed; files bundled in the APK. Accepted risk: the Edge read-aloud endpoint is unofficial and may change or be blocked, and its terms for a published app are unclear; mitigation: audio is generated once and committed, so the app never depends on the service, and Azure Speech (same voice) remains the fallback. (Superseded by the amendment of 2026-10-11: Azure Speech is used instead.)
- Amendment (2026-10-11, user decision): the Edge read-aloud service returned HTTP 403 to edge-tts 7.2.8 (latest); the voice files are generated with Azure Speech free tier F0 instead (same fr-FR-DeniseNeural voice). The key lives in user environment variables, never in a repository.
- Visuals: emoji + French name; generic pictogram when no emoji exists; no copyrighted images.
- Tone: tu. Player-facing strings in French.
- Telemetry (opt-in, anonymous): app open, game start, game end (found / given up, number of questions, number of wrong proposals), animal not found (the animal picked from the list).
- Out of scope v0.1: learning new animals, other languages, speech recognition, multiplayer, leaderboards, accounts, ads.
