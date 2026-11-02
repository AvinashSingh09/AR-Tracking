# AR Invite — DMCC image target

Phase 0 of [the PRD](PRD.md): a camera-based MindAR image tracker, an animated Three.js sculpture, and a video-textured panel. This is a working technical prototype, not the completed PRD or a phone-validated release.

**Live HTTPS prototype:** [ar-invite.onrender.com](https://ar-invite.onrender.com). Hosted on Render from this repository's `main` branch. Select Start and allow camera access. Deployment and desktop simulated-feed verification are recorded in [the deployment guide](docs/RENDER_DEPLOYMENT.md); physical mobile validation remains pending.

## Run locally

Tested here with Node 20.16.0 and npm 10.8.1. Dependencies are pinned in `package-lock.json`.

```powershell
cd 'G:\Projects\AR Invite'
npm ci
npm run dev
```

Open **http://localhost:5173** on this computer. The page shows only **Start**. Tapping it opens an edge-to-edge camera scanner; browser fullscreen is also requested where supported. A small × closes the scanner and stops the camera. Scanning guidance disappears after the target is found. Playback/replay prompts appear only when needed. The earlier marketing page, preview, and ordinary-player interface have been removed at the owner's request.

For the built artifact:

```powershell
npm run build
npm run preview
```

Open **http://localhost:4173**. The deployable files are in `dist/`; both `index.html` and `ar.html` are required. The Render site publishes that same multi-page build.

## Test on a phone

Phone camera access requires a secure context. A plain `http://192.168...` development URL is insufficient.

```powershell
npm run dev:https -- --port 5174
```

Use the HTTPS Network URL printed by Vite on a phone connected to the same network. The development certificate is self-signed: the phone/browser must trust it before this can be treated as a valid camera test. If the browser still rejects capture, use a trusted HTTPS preview deployment or a properly trusted local certificate. This setup does not provide a public URL or a production certificate. Check local firewall access if the URL cannot be reached.

1. Print/display the supplied `DMCC Smarter Chemistry Logo.png`, or use the cropped logo at `public/content/dmcc-v1/target.png` on another screen. Point at its logo area. The phone cannot scan an image displayed on its own screen.
2. Open the viewer and tap Start. Allow camera access.
3. Keep the entire target visible, add diffuse light, and avoid glare.
4. The video panel appears above the logo and faces the same viewing side as the artwork.
5. Check that the gold sculpture animates and the video visibly changes. The six-second sample is deliberately silent.
6. Remove the card: the scene should disappear and playback should pause. Return it: playback should continue unless manually paused or completed.
7. Use Replay when the sample ends, then use × to exit. The camera should stop on exit or when the page is hidden. Browser fullscreen may hide address bars; the camera still fills the viewport when that API is unavailable.
8. Test the actual print/display and lighting you will use. A desktop simulation does not establish physical-phone tracking reliability.

Record Android Chrome and iPhone Safari results in `docs/PHASE_0_STATUS.md`. Gate G0 stays open until those physical-device checks pass.

## Included assets

- `Visiting Card.jpeg`: original supplied photograph, untouched.
- `public/content/card-v1/target.jpg`: perspective-straightened, cropped, upright tracking candidate.
- `public/content/card-v1/target.mind`: compiled feature data for that exact candidate.
- `public/content/card-v2/target.png` and `target.mind`: previous card reference, retained for comparisons.
- `DMCC Smarter Chemistry Logo.png`: original new supplied artwork, untouched and kept local.
- `public/content/dmcc-v1/target.png` and `target.mind`: active reference, cropped to the existing logo to remove extensive white margins. No design details were repainted or generated. This is the only target loaded by the viewer.
- `public/content/unbranded-v1/demo.mp4` and `poster.jpg`: active six-second, silent, text-free procedural motion graphics. Generate them with `python scripts/generate-demo.py` (requires Pillow and ffmpeg). The earlier branded media is retained as a historical asset and is not loaded by the viewer.
- The gold orbital sculpture is procedural Three.js geometry, not a final character/avatar or a GLB model.

The active DMCC target contains 35 and 37 tracking points at the compiler's two tracking scales. That is descriptive feature data, not a phone reliability score. Recognition of the logo within the full supplied artwork passed a desktop synthetic-camera check; physical print/display trials remain necessary.

## Change content

Paths and aspect ratios are in `src/config.ts`. Scene placement, sculpture, lighting, and video geometry are in `src/scene.ts`. This prototype uses a typed configuration module; the full validated invitation-manifest system is deferred until after G0.

If changing target artwork, replace the active prepared PNG and compile it again:

```powershell
npm run compile-target
```

The compiler uses MindAR's CPU OfflineCompiler and an explicit `canvas` override to `@napi-rs/canvas`, avoiding a platform-specific node-canvas build. Current crop coordinates, dimensions, checksums, and feature counts are in `docs/dmcc-target-preparation.json`. Previous card records remain in `docs/target-v2-preparation.json` and `docs/target-preparation.json`. The compiler defaults to DMCC and accepts an explicit image path and metadata path, for example `npm run compile-target -- public/content/card-v2/target.png docs/target-v2-preparation.json`. Do not replace `.mind` data without matching the reference and its artwork aspect ratio.

## Checks and architecture

```powershell
npm test
npm run build
```

`src/policy.mjs` keeps playback intent separate from temporary tracking loss. The heavy tracker is deferred until Start. It runs in a same-origin iframe so each camera session has an isolated worker/GPU realm; explicit stop logic ends capture, terminates its worker, and disposes rendering resources before the frame is discarded. The initial screen loads no 3D preview or camera. Assets and scripts are served locally; no analytics or camera-upload endpoint is configured.

The tracked scene uses adaptive render-time pose smoothing. Small shakes receive stronger damping while larger movements catch up quickly; reacquisition resets to the current pose. Tuning and verification details are in [Tracking smoothing](docs/TRACKING_SMOOTHING.md).

The production bundle includes a large MindAR/TensorFlow chunk, generating Vite's chunk-size advisory. That runtime is loaded through the separate scanner page. Mobile startup/frame-time budgets remain to be measured.

Known Phase 0 boundaries: no final animated GLB, no final content approvals, no public hosting/QR, no admin/RSVP backend, no validated device support matrix, and no calibrated print-size measurements. Leaving/hiding AR tears down the session; a fresh or resumed session restarts the demo muted. Preferences and timeline survive target loss within a session, but are not persisted across complete session teardown. The complete PRD's resume-state persistence and other later-phase requirements are not yet complete.

Dependency and asset notes are in `docs/ASSETS_AND_DEPENDENCIES.md`.
