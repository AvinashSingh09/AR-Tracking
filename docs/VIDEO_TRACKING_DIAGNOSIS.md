# Screen-recording diagnosis and tracking revision

2 November 2026. Input: the owner's `VideoResult/1.mp4`, a 25.27-second 384×848 screen recording. The original recording remains local and is excluded from Git and the public deployment.

## What the recording establishes

- The scene repeatedly disappears while the card remains visible, then reacquires and snaps back. Examples occur around 6–8, 11–13, and 16 seconds. This is repeated tracking loss, not solely tiny pose jitter.
- The video panel is nearly edge-on during front-facing card views. The original scene rotated it 90 degrees relative to the artwork, so a card held vertically toward the phone exposed a thin edge. At more oblique card angles the panel became visible.
- Motion blur, reflections, and viewpoint changes are present. The recording alone cannot establish camera intrinsics, tracker frame rate on the phone, or exactly how much jitter comes from each source.
- The original target came from a different photograph with different shading and reflections. Its compiled tracking levels contain 13 and 15 points. Low point count is a likely contributor, not a universal quality score or proof by itself.

The first smoothing-only revision did not address the recognition failures. Its synthetic pose tests established filter behavior, not reliability on this physical card.

## Repeatable comparison

The local diagnostic harness crops the camera region at `(0,112,384,662)` from the recording. It seeks at 12 samples/second, processes a 2× resized input using the same MindAR 1.2.5 detector/matcher/tracker internals, and records whether a fresh pose is found. Total: 282 sampled frames. This bypasses SDK display warmup/miss buffering to measure successful fresh estimates rather than a cached visible pose.

The recording already contains AR overlays, browser rendering/compression, and a crop of the original camera feed. Consequently, it is a replay regression case, not an equivalent raw-camera measurement, a physical-phone benchmark, or a population-level tracking-success rate.

A clear, unaugmented view around 1.5 seconds was perspective-rectified into a 600×356 reference. Samples before 2 seconds are excluded from the comparison below. Later frames remain from the same recording; this is not an independent recording/lighting condition.

| Target candidate | Successful later samples | Later samples | Result |
| --- | --- | --- | --- |
| Original photographed target | 120 | 258 | 46.5% |
| Original with local contrast enhancement | 69 | 258 | 26.7%; rejected |
| Clear observed-card reference | 221 | 258 | 85.7%; selected |
| Observed reference with contrast enhancement | 211 | 258 | 81.8%; rejected |
| Median of aligned early clear frames | 221 | 258 | 85.7%; no improvement over the simpler selected reference |

The selected reference has 23 tracking points at each tracking scale. Its PNG and compiled data are versioned together under `public/content/card-v2/`; preparation and checksums are in `target-v2-preparation.json`. The old reference is retained unchanged for comparisons. No design details were generated or repainted.

## Runtime changes

1. Use the selected v2 reference for the actual card instead of the differently lit initial photograph.
2. Set MindAR native filter beta to 10, keeping minimum cutoff .001, and use warmup/miss tolerances of 2 frames. These are tunable values; frame counts are not wall-clock guarantees on different phones.
3. Shorten render-time stationary smoothing half-life from 65ms to 35ms, keeping 12ms moving response. Increase the rotation/translation error band before fast catch-up so moderate orientation noise is not immediately treated as deliberate motion. Current tests import the real profile rather than duplicating its values.
4. Stop feeding SDK-cached poses back into presentation smoothing during tolerated misses. Confirmed loss still hides the scene and resets the pose filter; there is no indefinite frozen overlay pretending to track.
5. Position the video above the card with its surface facing the artwork's viewing side. Reduce its offset out of the card plane from .32 to .06 target-width units to reduce the visual leverage of orientation errors.
6. Make the target compiler default to the v2 image/metadata while accepting explicit paths for other references. Keep the private recording and review derivatives out of the repository.

Settings are centralized in `src/tracking-profile.mjs`. Higher smoothing is not a substitute for a successful match. Do not tune solely to increase scene visibility by holding stale poses longer.

## Checks and limits

- Build and all six existing policy/filter tests pass using the current runtime smoothing profile.
- The full browser camera flow was also fed the cropped recording as a synthetic MediaStream at 768×1324. The updated viewer acquired the target, decoded the content video at 640px, and reacquired after gaps; it still lost tracking in some blurred/occluded intervals. This test is separate from the frame-sampled comparison above.
- In paired full-viewer replays, the baseline configuration (v1 target and prior SDK/render profile, injected into the current harness) produced 30 loss events between 2 and 23.5 seconds; the revised configuration produced 6. This comparison changes both reference and profile and cannot attribute the gain to either alone. Event records and method limits are in `video-replay-verification.json`.
- A clean source-artwork export remains preferable to a compressed photograph or recording-derived image. The selected reference is an evidence-based interim improvement, not a guarantee of identical behavior under other illumination or camera settings.
- A new physical-card trial on the reporting phone and the broader device matrix are still required before declaring the tracking reliable. Synthetic replay cannot close G0.

References: [MindAR tracking configuration](https://hiukim.github.io/mind-ar-js-doc/quick-start/tracking-config/), [pinned Controller behavior](https://github.com/hiukim/mind-ar-js/blob/master/src/image-target/controller.js).

## Release verification

App commit `36cbee597e9b3e7753782e9bdb1e04adbf53f660` was deployed to [AR Invite](https://ar-invite.onrender.com). Render deploy `dep-dbk3d7vb9u1s73cah040` reported `live`. The scanner HTML, its JavaScript bundle, and the v2 PNG/compiled target matched the local production build. The public URL's synthetic-feed smoke test decoded and played the 640px sample video, stopped camera tracks on exit, and produced no observed JavaScript page/console errors. The project build, type check, and all six tests passed under Node 22.23.4.

This release improves the reproduced case but does not eliminate every loss interval. A fresh recording/physical trial with the reporting phone is still needed; a clean original card artwork export would provide a stronger reference than a compressed screen-recording crop.
