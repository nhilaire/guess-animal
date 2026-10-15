# Device checks: Devine l'Animal v0.2.3

Manual commands run on 2026-10-15 against the release APK of commit e65ba46, the same build as REPORT.md
(`dist/guess-animal-0.2.3-universal.apk`, SHA-256 8afcb3fd4c5aee76...), on emulator sdk_gphone64_x86_64, Android 16
(API 36). Raw outputs are in `raw/` (local, git-ignored): `device-permissions.txt`, `maestro-airplane.txt`,
`maestro-airplane/` (screenshots).

## AC-23 permissions

`aapt2 dump permissions dist/guess-animal-0.2.3-universal.apk`: INTERNET, VIBRATE, ACCESS_NETWORK_STATE, WAKE_LOCK,
MODIFY_AUDIO_SETTINGS, and the app's own DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION. No RECORD_AUDIO, no AD_ID.
The arm64 APK size (< 45,000,000 bytes) is measured by the release build (`/release-apk`).

## AC-23 e2e flows in airplane mode

`adb shell cmd connectivity airplane-mode enable`, `settings get global airplane_mode_on` = 1 before and after,
`maestro test .maestro --exclude-tags telemetry` (installed versionName 0.2.3): **7/7 Flows Passed in 4m 25s**
(About, find the lion, give up, deterministic mode, settings, smoke, undo). Airplane mode disabled afterwards.
