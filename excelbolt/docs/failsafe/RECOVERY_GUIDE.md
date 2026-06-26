# Recovery Guide

## Backup

Use any of these buttons in the app:

- Dashboard: `Workspace Recovery` -> `Download backup`
- Settings -> `Security` -> `Download recovery file`
- Settings -> `Danger Zone` -> `Export Data`

Each backup is a JSON file containing:

- basic profile fields
- workspace preferences
- connector selections
- recent export history

When the user is signed in, a matching recovery snapshot is also written to Firestore under:

- `/users/{uid}/backups/{backupId}`

## Restore

1. Keep the backup JSON file outside the repo as a failsafe copy.
2. Sign in to ExcelBolt.
3. If local state is lost, use the JSON content as the source of truth for workspace values.
4. Reapply the values manually or import them through a future restore utility.

## Operational Note

If you enable Firebase App Check later, document the site key outside the repo and redeploy after setting `VITE_APP_CHECK_SITE_KEY`.
