# Device checks: Devine l'Animal v0.3.0

Manual commands run on 2026-10-26 against the release APK of commit 55bb461, the same build as REPORT.md
(`dist/guess-animal-0.3.0-universal.apk`, SHA-256 7a7c9babd4b27896...), on emulator sdk_gphone64_x86_64, Android 16
(API 36), system language en-US. Raw outputs are in `raw/` (local, git-ignored): `device-permissions.txt`,
`device-label.txt`, `device-fr-first-launch.txt` (+ flow `device-fr-first-launch.yaml`), `maestro-airplane.txt`,
`maestro-airplane/` (screenshots).

## AC-23 permissions

`aapt2 dump permissions dist/guess-animal-0.3.0-universal.apk`: INTERNET, VIBRATE, ACCESS_NETWORK_STATE, WAKE_LOCK,
MODIFY_AUDIO_SETTINGS, and the app's own DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION. No RECORD_AUDIO, no AD_ID (same
list as v0.2.3: expo-localization adds no permission). The arm64 APK size (< 50,000,000 bytes) is measured by the
release build (`/release-apk`).

## AC-23 e2e flows in airplane mode

`adb shell cmd connectivity airplane-mode enable`, `settings get global airplane_mode_on` = 1 before and after,
`maestro test .maestro --exclude-tags telemetry` (installed versionName 0.3.0): **8/8 Flows Passed in 5m 24s**
(About, find the lion, give up, language, deterministic mode, settings, smoke, undo). Airplane mode disabled
afterwards (`airplane_mode_on` = 0).

## AC-39 launcher name per language

`aapt2 dump resources` (raw/device-label.txt):

```
resource 0x7f12001f string/app_name
  () "Guess the Animal"
  (en) "Guess the Animal"
  (fr) "Devine l'Animal"
```

`aapt2 dump badging`: `application-label:'Guess the Animal'`, `application-label-en:'Guess the Animal'`,
`application-label-fr:'Devine l'Animal'`.

## AC-01 consent in French at first launch on a French-language setting

The emulator system language is en-US (the Maestro run of REPORT.md shows the English consent, `screens/01-consent.png`).
To prove the French first launch on the same build, the app's language was set to French with Android's per-app
language (Android 13+), the system staying en-US (raw/device-fr-first-launch.txt):

```
$ adb shell pm clear io.github.nhilaire.guessanimal                 -> Success
$ adb shell cmd locale set-app-locales io.github.nhilaire.guessanimal --locales fr-FR
$ adb shell cmd locale get-app-locales io.github.nhilaire.guessanimal   -> [fr-FR]
$ maestro test fr-first-launch.yaml
  consent-screen visible; "Statistiques anonymes", "Accepter", "Refuser" visible; tap consent-refuse;
  "Jouer" and "Devine l'Animal" visible -> all steps COMPLETED
```

Screenshots: `screens/device-fr-consent.png`, `screens/device-fr-home.png`. The app's language was reset afterwards
(`set-app-locales ... --locales ""` -> `[]`).
