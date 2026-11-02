# AR Invite — 360 Bright Media prototype

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

1. Print `public/content/card-v1/target.jpg`, or show it on another screen. The phone cannot scan an image displayed on its own screen.
2. Open the viewer and tap Start. Allow camera access.
3. Keep the entire target visible, add diffuse light, and avoid glare.
4. Tilt the card slightly to see the upright video panel. Viewed exactly front-on, an upright panel can appear edge-on.
5. Check that the gold sculpture animates and the video visibly changes. The six-second sample is deliberately silent.
6. Remove the card: the scene should disappear and playback should pause. Return it: playback should continue unless manually paused or completed.
7. Use Replay when the sample ends, then use × to exit. The camera should stop on exit or when the page is hidden. Browser fullscreen may hide address bars; the camera still fills the viewport when that API is unavailable.
8. Separately test the actual original visiting card. Recognition of a print of the prepared target does not prove recognition of the original card under different reflections.

Record Android Chrome and iPhone Safari results in `docs/PHASE_0_STATUS.md`. Gate G0 stays open until those physical-device checks pass.

## Included assets

- `Visiting Card.jpeg`: original supplied photograph, untouched.
- `public/content/card-v1/target.jpg`: perspective-straightened, cropped, upright tracking candidate.
- `public/content/card-v1/target.mind`: compiled feature data for that exact candidate.
- `public/content/card-v1/demo.mp4` and `poster.jpg`: locally authored procedural motion graphics for prototype testing, not the reference PlugXR recording.
- The gold orbital sculpture is procedural Three.js geometry, not a final character/avatar or a GLB model.

The supplied card photograph contains large dark regions and photographed reflections. The compiled target has detectable features, but real-print reliability has not been established. A clean digital artwork export may improve results.

## Change content

Paths and aspect ratios are in `src/config.ts`. Scene placement, sculpture, lighting, and video geometry are in `src/scene.ts`. This prototype uses a typed configuration module; the full validated invitation-manifest system is deferred until after G0.

If changing target artwork, replace the prepared JPG and compile it again:

```powershell
npm run compile-target
```

The compiler uses MindAR's CPU OfflineCompiler and an explicit `canvas` override to `@napi-rs/canvas`, avoiding a platform-specific node-canvas build. Preparation coordinates/checksums and compilation feature counts are recorded in `docs/target-preparation.json`. Do not replace `.mind` data without matching the displayed guide and approved print.

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
