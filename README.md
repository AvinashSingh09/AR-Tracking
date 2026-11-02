# AR Invite — image overlay

**Live HTTPS prototype:** [ar-invite.onrender.com](https://ar-invite.onrender.com).

Tap **Start** and allow the camera. Scan the plain golden archway background to reveal the complete invitation directly over it. The image follows the background as it moves, disappears when tracking is lost, and returns on reacquisition. The only persistent camera control is the small × to exit. No video, sound controls, or sculpture is loaded in this experience.

## Target and overlay

| Role | Owner-supplied file | Published asset |
| --- | --- | --- |
| Scan target | `NEW IMAGES/Golden Archway Over a Futuristic Waterfront.png` | `public/content/archway-v1/target.png` and `target.mind` |
| Revealed invitation | `NEW IMAGES/Unknown-16.png` | `public/content/archway-v1/overlay.png` |

The original images are copied byte-for-byte. The full 941×1671 background is compiled for recognition. The 941×1672 overlay is fitted to the same four corners; the one-pixel height difference does not require a crop. The overlay is an opaque image over the target plane, so the invitation's complete composition appears in place. No details or text have been generated or repainted. Preparation, checksums, and feature counts are in [the target record](docs/archway-target-preparation.json).

Display the plain background on another screen or print it flat. Keep the complete artwork visible, with diffuse light and minimal glare. The scanning phone cannot scan an image on its own screen. Similarity between the two supplied images is expected: recognition uses the background's existing architectural detail, while the invitation artwork supplies the added text.

## Run and build

```powershell
cd 'G:\Projects\AR Invite'
npm ci
npm run dev
```

Open **http://localhost:5173** on this computer. For a production build:

```powershell
npm test
npm run build
npm run preview
```

The preview is **http://localhost:4173**. Both `index.html` and `ar.html` must be deployed from `dist/`. Node is pinned in `.node-version`; dependencies are pinned in `package-lock.json`.

Phone camera access requires HTTPS. Use the live Render URL, or `npm run dev:https -- --port 5174` on the same local network with its development certificate trusted on the phone. Plain HTTP network addresses cannot provide normal mobile camera access.

## Change artwork

Paths and the full target aspect ratio are in `src/config.ts`. `src/scene.ts` maps the overlay to a centered plane exactly one target-width wide; it must stay coplanar to match the printed background. `src/ar.ts` loads the overlay before tracking starts, handles camera/worker lifetime, and uses the existing adaptive pose smoothing. It stops the camera and disposes GPU resources on exit or when the page is hidden. No camera upload endpoint or analytics is configured.

Recompile after changing the background:

```powershell
npm run compile-target
```

The compiler defaults to the archway background and updates its preparation record. For an earlier target, pass both image and metadata paths explicitly. Compilation uses MindAR 1.2.5 OfflineCompiler on CPU with `canvas` overridden to `@napi-rs/canvas`.

## Verification and history

Build/tests and desktop synthetic-camera recognition/alignment checks are recorded in [the verification record](docs/archway-verification.json) and are distinct from physical device validation. Test the actual print or display on Android Chrome and iPhone Safari before treating tracking as phone-validated. Existing Phase 0 physical-device gate G0 remains open.

Previous DMCC, card, invitation-video, and procedural sample assets remain in `public/content/` for history; the current configuration only loads `archway-v1`. The original `NEW IMAGES` folder stays local and ignored. [Deployment settings](docs/RENDER_DEPLOYMENT.md), [tracking smoothing](docs/TRACKING_SMOOTHING.md), and [asset records](docs/ASSETS_AND_DEPENDENCIES.md) provide maintenance context. Older validation records apply to their named targets, not automatically to the new artwork.

The tracker runtime still produces Vite's large-chunk advisory. It loads only after Start; physical mobile startup and frame-time budgets remain unmeasured.
