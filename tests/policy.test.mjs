import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPlay, cameraMessage } from '../src/policy.mjs';
test('loss and suspension cannot override manual pause or completed playback', () => {
  for (const state of [
    { active: true, tracked: false, playing: true, ended: false },
    { active: false, tracked: true, playing: true, ended: false },
    { active: true, tracked: true, playing: false, ended: false },
    { active: true, tracked: true, playing: true, ended: true },
  ]) assert.equal(shouldPlay(state), false);
  assert.equal(shouldPlay({ active: true, tracked: true, playing: true, ended: false }), true);
});
test('camera recovery distinguishes denial, absent hardware, and camera contention', () => {
  assert.match(cameraMessage({ name: 'NotAllowedError' }), /settings/);
  assert.match(cameraMessage({ name: 'NotFoundError' }), /No camera/);
  assert.match(cameraMessage({ name: 'NotReadableError' }), /busy/);
});
