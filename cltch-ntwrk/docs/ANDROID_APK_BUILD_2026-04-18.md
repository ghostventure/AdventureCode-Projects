# CLTCH.NTWRK Android APK Build - 2026-04-18

Built a direct-install Android debug APK for CLTCH.NTWRK.

## Scope

- Rebuilt the mobile-web mirror.
- Synced the Capacitor Android project.
- Added local Android SDK path configuration for this machine.
- Built a debug Android package installer.
- Copied the APK into the repo `release/` folder with a clear CLTCH filename.

## Commands

- `npm run sync:android`
- `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew assembleDebug`

## Outputs

- `release/CLTCH-NTWRK-Android-Debug-1.0.0.apk`
- `android/app/build/outputs/apk/debug/app-debug.apk`

## Verification

- `npm run sync:android` passed.
- First Gradle run with Java 25 failed because the project's Gradle tooling did not support class file major version 69.
- Second Gradle run with Java 17 failed because Capacitor Android targets source release 21.
- Final Gradle run with Java 21 passed.
- `file release/CLTCH-NTWRK-Android-Debug-1.0.0.apk` confirmed the output is an Android package with an APK signing block.
- APK size is about `4.3 MB`.

## Recovery Notes

- Keep `android/local.properties` pointed at `/home/sniper-lion-main/Android/Sdk` on this machine.
- Use Java 21 for CLTCH Android APK builds:
  - `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew assembleDebug`
- The debug APK is intended for direct testing and field review. A production Play Store release needs release signing and store packaging setup.
