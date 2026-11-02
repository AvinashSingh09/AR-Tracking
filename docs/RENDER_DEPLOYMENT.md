# Render deployment

Deploy the current single-Start-button, full-viewport camera viewer as a **Static Site**. It needs no running Node server or database after building. Render supplies a public HTTPS URL with a managed certificate, removing the local self-signed-certificate requirement.

## Prepared settings

| Setting | Value |
| --- | --- |
| Service type | Static Site |
| Service name | `ar-invite` |
| Git source | `https://github.com/AvinashSingh09/AR-Tracking.git` |
| Branch | `main`, unless the selected source uses another branch |
| Root directory | Repository root |
| Build command | `npm ci --include=dev && npm run build` |
| Publish directory | `dist` |
| Node version | `22.23.4`, pinned in `.node-version` |
| Environment variable | `SKIP_INSTALL_DEPS=true` so the build command owns installation |
| Auto deploy | On commit to the selected branch |
| Workspace | `My Workspace` — confirmed by the owner |

The site was created through the Render connector after the owner confirmed My Workspace and supplied the repository. GitHub upload used the connected GitHub tools; public Git fetch keeps the local checkout synchronized. The local GitHub CLI is not authenticated. Do not assume that connector authentication is shared with local CLI credentials.

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

**Live:** [https://ar-invite.onrender.com](https://ar-invite.onrender.com), verified on 2 November 2026.

| Record | Value |
| --- | --- |
| Render workspace | My Workspace |
| Service ID | `srv-dbk2qv2jnfac739e7k70` |
| Initial deploy ID | `dep-dbk2qvijnfac739e7kug` |
| Initial deployed app commit | `1a5178c23a616710f280193c5505781552c37b68` |
| Current deployed app commit | `1d7bab42b43d70fff6849cb61a733bbfe8409eac` |
| Current deploy ID | `dep-dbk3s115efls73eka2fg` |
| Deployment status | `live` |
| Dashboard | [Render service](https://dashboard.render.com/static/srv-dbk2qv2jnfac739e7k70) |

The Render build used Node 22.23.4 and completed successfully. Public HTTPS fetches returned the correct viewer/scanner HTML, compiled target, card image, MP4, poster, and icon. HTML comparison normalized Windows/Linux line endings; binary assets matched the local build exactly. MP4 byte-range requests returned 206 with the expected 1024-byte response; a nonexistent media resource returned 404.

Desktop Chrome verification against the public URL confirmed a secure context, exactly one initial Start button, no pre-start camera frame, real tracker acquisition from a synthetic camera feed, decoded 640px content video with advancing playback time, a 1280×900 frame filling the viewport, and ended camera tracks after exit. No JavaScript page or console errors were observed. The JSON evidence is in `docs/render-verification.json`; screenshot inspection artifacts remain in ignored `output/`.

Physical-card recognition, lighting tolerance, and Android/iPhone performance remain unverified. Deployment does not close G0. Future documentation-only commits can use `[skip render]` to avoid an unnecessary rebuild; application changes should deploy normally through the configured commit trigger.

The active target is now the DMCC Smarter Chemistry logo at `/content/dmcc-v1/`. Its 810×380 reference crops white margins from the supplied PNG without altering logo detail; it contains 35 and 37 tracking points at the compiler's tracking scales. Page metadata, scan hint, aspect ratio, and compiler defaults match the new target. Current verification is in `dmcc-verification.json` and crop/checksum metadata in `dmcc-target-preparation.json`. Public HTML and target assets matched the build, and a desktop synthetic camera feed of the full supplied PNG triggered decoded video playback and correct camera shutdown on exit. Physical-phone validation of this logo remains pending.

The earlier card-v2 reference and tuning work are retained as history. Its paired recording-replay results do not apply to DMCC; see [Recording diagnosis](VIDEO_TRACKING_DIAGNOSIS.md) for those prior tests. The current smoothing profile and single-button/full-viewport flow are retained.

References checked on 2 November 2026: [Static Sites](https://render.com/docs/static-sites), [Node version configuration](https://render.com/docs/node-version).
