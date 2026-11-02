# Tracking smoothing

2 November 2026 — response to slight jitter reported during physical-card use.

**Follow-up:** The subsequent screen recording revealed recognition dropouts that presentation smoothing alone could not solve. Current code uses a new card reference, tuned SDK tolerances/filtering, and a lower-lag profile in `src/tracking-profile.mjs`. See [recording diagnosis](VIDEO_TRACKING_DIAGNOSIS.md) for the new evidence. The initial implementation/profile/deployment below is retained as historical context.

The original viewer copied each MindAR pose directly to the scene root when a tracking update arrived. The revised viewer retains the latest measured pose and smoothly approaches it on each rendered frame. This reduces small pose fluctuations and visible stepping between tracker updates without changing the camera feed or the model's intentional animation.

## Implementation

- `src/pose-smoother.mjs` interpolates position and scale and uses quaternion slerp for orientation. It composes a rigid pose instead of averaging matrix elements.
- `src/ar.ts` applies the measured-to-target transform once per tracker update and advances smoothing using real elapsed render time. Shared model/video content continues to follow one root.
- Small translation/rotation errors use stronger damping; larger deliberate moves shorten the response time. Translation thresholds are normalized to the tracked image width, so the controller's pixel-sized coordinates do not change the feel.
- First acquisition and reacquisition snap to the new pose immediately. Confirmed tracking loss still hides content and pauses playback; smoothing does not keep a stale scene floating on screen.
- Target transform matrices are reused, avoiding repeated matrix/vector allocation in the tracking callback.
- MindAR's existing native smoothing and detection/loss tolerances remain at their defaults. This change adds presentation smoothing after the tracker; it does not claim to increase recognition accuracy.

## Tunable profile

Settings live in `tracking.smoothing` in `src/config.ts`:

| Setting | Initial value | Purpose |
| --- | --- | --- |
| `stationaryHalfLife` | 0.065 seconds | Stronger smoothing for small fluctuations. |
| `movingHalfLife` | 0.012 seconds | Faster response to a significant change in pose. |
| `translationResponse` | 0.04 of target width | Translation error at which fast response is fully engaged. |
| `rotationResponse` | 0.12 radians | Rotation error at which fast response is fully engaged. |

These half-lives describe the adaptive filter response, not a fixed end-to-end camera/tracker latency guarantee. Increasing stationary smoothing can make very small real movements feel delayed. Do not increase damping indefinitely to compensate for poor artwork, reflections, motion blur, or low tracking performance.

## Verification

The build and six tests passed locally, including deterministic checks that:

- stationary synthetic position and orientation noise each have more than 60% lower RMS amplitude after filtering;
- deliberate translation/rotation reaches the specified response bounds within 120ms at 30, 60, and 120 render frames per second;
- acquisition/reacquisition does not interpolate across an old scene position;
- target-width normalization produces equivalent results at scales 1 and 960;
- existing playback intent and camera-error policies continue to work.

Desktop Chrome integration using the real tracker and a synthetic camera feed also passed recognition/video, blank-frame loss, target reacquisition, and camera-track shutdown on exit, with no observed JavaScript page/console errors. These checks establish integration and filter behavior; actual smoothness on the reporting phone still requires a repeat physical-card trial.

## Deployment

Published to [AR Invite](https://ar-invite.onrender.com) from app commit `65bd11cf9eaf1cbdc9248d6c36f09b161854ae87`. Render deploy `dep-dbk2vutg1s2s738i2jqg` reported live. The public scanner HTML and `/assets/ar-BU3L6LIL.js` matched the local build; bundle SHA-256 was `cbc3e37a7e3b4f8c072dad58647579406a89a35823cb5787d16e28213f5252a9`.

The deployed desktop synthetic-feed check produced decoded 640px video with advancing playback time, ended camera tracks after exit, and no observed page/console errors. Refresh or reopen the viewer for the updated scanner; a session already open before deployment retains its old JavaScript until reloaded.

Reference: [MindAR tracking configuration and smoothing/latency tradeoff](https://hiukim.github.io/mind-ar-js-doc/quick-start/tracking-config/).
