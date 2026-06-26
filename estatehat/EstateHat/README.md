# EstateHat

EstateHat now ships its web app from a single Next.js route surface.

## Canonical Routes

- `/` landing
- `/signin` sign in and registration
- `/home` authenticated app
- `/about`, `/help`, `/faq`, `/invest`, `/press`, `/terms`, `/privacy`, `/accessibility`, `/dmca` public information pages

Compatibility redirects remain for older links, but the old static HTML entry points and Vite web build are retired.

## Commands

- `npm run dev`
- `npm run build`
- `npm run deploy:hosting`

## Output

- Web export: `out/`
- Capacitor webDir: `out`
- Electron packaged web assets: `out`
