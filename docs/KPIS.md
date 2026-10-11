# KPIs and monitoring: Devine l'Animal

Firebase project: guess-animal (exact project id: Firebase console > Project settings > General; free Spark plan,
never upgraded to Blaze)
Android app: io.github.nhilaire.guessanimal
Data collection: opt-in only (consent screen). Analytics data retention: 2 months. Google signals: off.

## Telemetry events (from docs/PRD.md, typed in src/telemetry/events.ts)

| Event | When | Params |
|---|---|---|
| game_start | a game starts (Jouer / Rejouer) | none |
| game_end | a game ends | result (found / given_up / quit), questions (int), wrong_guesses (int 0-3) |
| animal_missed | the player picks an entry on the Give up screen | animal (fixed animal id, or `not_listed`) |

App opens: automatic `session_start` / `first_open` events (after consent).

## Business KPIs

| KPI | Definition | Where to read it | Target |
|---|---|---|---|
| Guess success rate | `game_end` result=found / `game_end` result in (found, given_up) | Analytics > Reports > Events > game_end, breakdown by custom dimension `result` (or Explore > Free form) | ≥ 80 % |
| Questions to find | median of `questions` on `game_end` where result=found | Explore > Free form: `game_end`, filter `result`=found, metric `questions` | median ≤ 15 |
| Missed animals | count of `animal_missed` by `animal` | Analytics > Reports > Events > animal_missed, custom dimension `animal` | top list reviewed monthly to fix the data |
| Games per session | `game_start` count / `session_start` count | Analytics > Reports > Events | ≥ 2 |
| App opens (DAU) | daily active users | Analytics > Reports > Engagement overview | followed, no target |
| D1 retention | % of new users back on day 1 | Analytics > Reports > Retention | ≥ 20 % |

## Technical KPIs

| KPI | Definition | Where to read it | Target |
|---|---|---|---|
| Crash-free users | % users without a fatal crash | Crashlytics > Dashboard | ≥ 99 % |
| ANR rate | app not responding events | Crashlytics > Dashboard (filter ANR) | ~0 |
| Non-fatal errors | `reportError()` calls (e.g. audio playback failures) | Crashlytics > Non-fatals | low and stable |
| APK size | arm64 release APK size, audio included | docs/evidence/v*/REPORT.md | < 40 MB |
| Cold start | launch to first screen | evidence report (device check) | < 3 s |

## Custom definitions to register in Analytics

Analytics > Admin > Custom definitions (free, up to 50 dimensions / 50 metrics):

| Name | Scope | Param | Type |
|---|---|---|---|
| result | Event | result | dimension |
| animal | Event | animal | dimension |
| questions | Event | questions | metric (standard) |
| wrong_guesses | Event | wrong_guesses | metric (standard) |

## Console settings checklist (done by the user)

- Analytics > Admin > Data settings > Data retention: 2 months.
- Analytics > Admin > Data settings > Data collection: Google signals off.
- Project settings > General > Android app: SHA-1 fingerprint of the release key added (public value from
  `~/.android-game-factory/release-cert.txt`).
- Google Cloud console > APIs & Services > Credentials > "Android key (auto created by Firebase)": restricted to
  Android apps (package `io.github.nhilaire.guessanimal` + SHA-1) and to Firebase APIs only.

## How to check that events arrive

1. Build with `firebase/google-services.json` present, accept the consent screen.
2. `adb shell setprop debug.firebase.analytics.app io.github.nhilaire.guessanimal` then open Analytics > DebugView.
3. The factory's `verify.mjs --telemetry` captures the `Logging event` lines from logcat as evidence.
Standard reports update within ~24 h; DebugView is real time.
