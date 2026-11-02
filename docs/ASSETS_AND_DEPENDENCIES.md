# Assets and dependency record

## Assets

| Item | Origin | Use |
| --- | --- | --- |
| `Visiting Card.jpeg` | User-supplied 360 Bright Media card photograph | Original retained in workspace; reproduction rights to be confirmed before public publishing. |
| `target.jpg` | Geometric crop/rectification and 90-degree rotation of that photograph | Tracking candidate and guide. Coordinates and checksums are recorded. |
| `target.mind` | MindAR OfflineCompiler output from `target.jpg` | Target recognition. |
| `card-v2/target.png` and `target.mind` | Perspective-corrected card-only crop from a clear, unaugmented frame of the owner's local recording | Previous card target retained for comparison; full recording, hand, browser UI, and background are not published as assets. |
| `dmcc-v1/target.png` and `target.mind` | Crop of the owner's `DMCC Smarter Chemistry Logo.png`, removing white margins without altering logo detail | Previous target, retained as history. Original PNG stays local. Crop/checksums/features are in `dmcc-target-preparation.json`. |
| `demo.mp4`, `poster.jpg` | Locally generated grid, rings, text, and animated progress line; 640×360, 24fps, 6 seconds, no audio | Clearly labelled prototype content. |
| `unbranded-v1/demo.mp4`, `poster.jpg` | Locally generated grid, orbital rings, moving dot, and progress line; 640×360, 24fps, 6 seconds, no audio or text | Previous playback media, retained as history; reproducible with `scripts/generate-demo.py`. |
| `invite-v1/invite.mp4`, `poster.jpg` | Owner-supplied `Invite Video.mp4`, 720×1280, approximately 10 seconds; H.264 frames preserved, audio converted to AAC-LC, fast-start MP4 plus extracted still | Previous DMCC invitation playback, retained as history; not loaded by the current image-overlay viewer. |
| `archway-v1/target.png`, `target.mind` | Owner-supplied plain archway background, copied without image edits and compiled with MindAR | Current scan target; see `archway-target-preparation.json`. |
| `archway-v1/overlay.png` | Owner-supplied `NEW IMAGES/Unknown-16.png`, copied without edits | Complete invitation fitted directly over the target plane; no video or 3D sculpture in this experience. |
| Gold orbital sculpture | Previous procedural icosahedron, torus rings, and base (see repository history) | Previous placeholder 3D content; not loaded by the current image-overlay viewer. No extracted/copied character from reference video. |
| `favicon.svg` | Simple project-authored text/circle mark | Prototype icon, not an approved replacement for the supplied brand logo. |
| `ar-icon.svg` | Project-authored circles and orbital shape, with no text | Current browser icon, replacing the previous numbered icon. |
| Fonts | System Segoe UI/sans-serif stack | No external font network requests. No font files redistributed. |

The PlugXR reference video is not bundled into the web application. Final visual identity, model, video/music, and redistribution rights remain content-owner inputs before a public release.

## Pinned packages

Runtime: `mind-ar@1.2.5` and `three@0.160.0`. Build: Vite, TypeScript, Three.js type definitions, and Vite basic SSL at the exact versions in `package-lock.json`. Native compiler canvas is overridden to `@napi-rs/canvas@0.1.80`. Keep the override when reproducing the compiler; do not silently replace it with node-canvas.

MindAR and Three.js use MIT licenses; inspect installed package `LICENSE` files and all transitive notices when preparing distribution. Dependency versions are pinned for reproducibility, not a permanent compatibility/security guarantee. The npm installation reported no known vulnerabilities at this point in time; that is not a full security audit.

## Technical references

- [MindAR target compilation](https://hiukim.github.io/mind-ar-js-doc/quick-start/compile/)
- [MindAR Three.js integration](https://hiukim.github.io/mind-ar-js-doc/more-examples/threejs-image/)
- [MindAR Controller source](https://github.com/hiukim/mind-ar-js/blob/master/src/image-target/controller.js)
- [Three.js VideoTexture](https://threejs.org/docs/pages/VideoTexture.html)
- [Camera secure-context and permission behavior](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

The prototype owns a small tracking adapter using the pinned Controller API rather than the SDK Three.js wrapper so camera cancellation, worker termination, pose mapping, and frame teardown remain explicit. Controller internals are version-sensitive and need rechecking before upgrades.
