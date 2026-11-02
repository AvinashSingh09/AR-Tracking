# Phase 0 implementation and evidence

Date: 2 November 2026. **G0 is not yet passed.** The Android and iPhone physical-print checks required by the PRD remain outstanding.

## Latest interface revision — single-button camera flow

The owner's subsequent direction supersedes the original landing-page UI: only Start appears initially; after tapping, the camera fills the viewport. The preview, promotional text, instructions section, and ordinary video player were removed. Only an exit control, necessary scanning/error feedback, and conditional playback/replay prompts remain. The historical initial-prototype observations below describe the previous UI where applicable.

Verified after this revision: the built page exposes exactly one visible button before starting and no camera iframe; actual tracker recognition and decoded video still work with the desktop synthetic feed; camera frame bounds equal the viewport at 1280×900, 390×844, and 844×390 without horizontal overflow; browser fullscreen works in the desktop check; the viewport fallback was checked with fullscreen unavailable; exit ends captured camera tracks and removes the frame. Build and existing policy tests pass. No JavaScript console errors were observed in this check. Physical mobile validation remains pending.

## Implemented

- Responsive 360 Bright Media landing page and clearly labelled camera-free scene preview.
- Upright perspective-corrected target candidate derived from the supplied photograph, with original retained.
- Offline-compiled MindAR target and recorded feature counts/checksums.
- Real image detection and pose-driven shared Three.js scene root.
- Animated procedural gold sculpture and six-second original sample MP4 on a floating surface.
- Target-loss pause/hide, reacquisition, manual pause preservation, replay, mute control, end-of-video restart, and source-video visibility handling.
- Explicit camera start, cleanup on exit/fallback, hidden-page suspension, bounded initialization wait, and useful camera-denial recovery.
- Ordinary video view, local build commands, optional local HTTPS, and pinned dependencies.

## Verified here

| Check | Evidence/result | Boundary |
| --- | --- | --- |
| Target compilation | `.mind` created using MindAR 1.2.5 OfflineCompiler; source and output metadata in `target-preparation.json` | Compilation does not establish real-world reliability. |
| Type checking and production build | `npm run build` passed; both viewer and scanner HTML emitted | Vite reports a large deferred tracker chunk. |
| Playback policy checks | `npm test`: 2 tests passed | Covers intent guards and normalized camera errors only. |
| Browser visual review | Desktop 1280px and narrow 390px layouts inspected; no horizontal overflow at 390px | Desktop Chrome viewport emulation, not an iPhone test. |
| Actual tracker integration | Desktop Chrome with Chromium's fake camera fed a video of the compiled target: real tracker emitted image found | Synthetic feed, not a physical print/camera. |
| Decoded content video | Built artifact reported 640px decoded width and advancing currentTime; source video CSS display was `none` | Visible video texture also reviewed in screenshot. |
| Manual pause and reacquisition | Replaced the synthetic camera input with blank canvas then redrew the target; real tracker reported loss and reacquisition | Paused content time stayed 0.3308s across loss/reacquisition in this run. |
| Exit cleanup | Captured camera MediaStreamTrack references before exit; all were `ended` after exit; scanner iframe removed | Verified desktop browser session, not every mobile lifecycle path. |
| End-of-video Play | Waited for six-second video completion, pressed Play, and verified resumed playback from the beginning | Production artifact browser check. |
| Denial recovery | Injected `NotAllowedError` into capture; denial message shown, ordinary view usable, no scanner iframe retained | Simulated permission failure. |
| Console | Production smoke check had no page JavaScript errors | An early favicon 404 was corrected by placing the icon link in the head. |

Screenshots and transient browser scripts/logs are under ignored `output/` and `.playwright-cli/`. They are inspection artifacts, not production assets or physical-device acceptance records.

## Required before closing G0

| Device | Browser/OS | Final/actual target recognition | Moving video/model | Loss/reacquisition | Exit camera stop | Load/frame timings | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Android phone — not inventoried | Pending | Pending | Pending | Pending | Pending | Pending | Not tested |
| iPhone — not inventoried | Pending | Pending | Pending | Pending | Pending | Pending | Not tested |

Use a trusted HTTPS page, record exact device/browser versions, test both the prepared target print and original physical card, and note lighting, finish, and viewing angle. Propose the full five-device matrix after baseline trials. No acquisition percentage, latency percentile, frame-rate guarantee, or all-phone compatibility claim has been established.

Final model/video replacement and later PRD phases should wait for the G0 feasibility evidence.
