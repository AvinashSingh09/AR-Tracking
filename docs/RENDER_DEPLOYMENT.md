# Render deployment

Deploy the current single-Start-button, full-viewport camera viewer as a **Static Site**. It needs no running Node server or database after building. Render supplies a public HTTPS URL with a managed certificate, removing the local self-signed-certificate requirement.

## Prepared settings

| Setting | Value |
| --- | --- |
| Service type | Static Site |
| Proposed service name | `ar-invite` (Render must confirm name availability) |
| Git source | `https://github.com/AvinashSingh09/AR-Tracking.git` |
| Branch | `main`, unless the selected source uses another branch |
| Root directory | Repository root |
| Build command | `npm ci --include=dev && npm run build` |
| Publish directory | `dist` |
| Node version | `22.23.4`, pinned in `.node-version` |
| Environment variable | `SKIP_INSTALL_DEPS=true` so the build command owns installation |
| Auto deploy | On commit to the selected branch |
| Workspace | `My Workspace` — confirmed by the owner |

Use the Render connector to create the site once the user has identified its workspace and supplied a pushed repository accessible to Render. The connected GitHub tools can write files to existing repositories but do not expose repository creation. The local GitHub CLI is not authenticated. Do not assume that the GitHub connector's authentication is shared with the CLI or with Render's private-repository integration.

## Source contents

The deployment needs `index.html`, `ar.html`, `src/`, `public/`, `vite.config.js`, `tsconfig.json`, `package.json`, `package-lock.json`, and `.node-version`. Include `tests/`, `scripts/`, README, and relevant project documentation for maintenance. The `.mind` target is already compiled and checked into `public/`; building does not recompile it.

The original reference MP4, raw card photograph, review stills, browser artifacts, local TLS certificates, and `node_modules` are excluded from Git. The prepared card target and generated sample video inside `public/content/card-v1/` remain included because the running viewer uses them.

## Routing and browser requirements

- Serve both `/` and `/ar.html` as their actual HTML files. This is a multi-page build; do not replace `/ar.html` with an SPA catch-all.
- Missing targets or videos must return a real error rather than the landing HTML.
- The camera scanner is a same-origin iframe. Do not set `X-Frame-Options: DENY` or `frame-ancestors 'none'`; those would block it. A same-origin frame policy is compatible.
- If adding a Permissions-Policy, permit `camera=(self)` and preserve same-origin autoplay/fullscreen support. The application does not request microphone access.
- No custom domain is required for initial testing; the assigned `onrender.com` HTTPS address is sufficient.
- No secrets or application environment variables are needed by the current client-only viewer.

## Verification after deployment

1. Wait for the Render deployment to report live; record the actual service ID and URL.
2. Fetch `/`, `/ar.html`, `/content/card-v1/target.mind`, and `/content/card-v1/demo.mp4` through the public HTTPS origin.
3. Check HTML/media types, TLS, and actual media seeking/range delivery where applicable.
4. Open the public URL: only Start should appear; tapping opens the edge-to-edge camera.
5. Re-run synthetic-feed tracking/video and camera-exit checks against that public artifact.
6. Test the physical card on Android Chrome and iPhone Safari. A live deployment does not close the outstanding physical-device G0 gate.

## Current deployment status

Source repository and Render workspace supplied by the owner; source upload in progress. **Not deployed yet.** The first service creation will use the confirmed My Workspace destination.

References checked on 2 November 2026: [Static Sites](https://render.com/docs/static-sites), [Node version configuration](https://render.com/docs/node-version).
