import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { PoseSmoother } from '../src/pose-smoother.mjs';
import { tracking } from '../src/tracking-profile.mjs';

const settings = tracking.smoothing;
function target(x, angle = 0, width = 1) {
  return new Matrix4().compose(new Vector3(x * width, 0, -2 * width), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle), new Vector3(width, width, width));
}
function read(matrix) {
  const p = new Vector3(), q = new Quaternion(), s = new Vector3();
  matrix.decompose(p, q, s); return { p, q, s };
}
test('stationary position and orientation noise are substantially reduced', () => {
  const filter = new PoseSmoother(settings);
  let inputEnergy = 0, positionEnergy = 0, rotationEnergy = 0;
  filter.setTarget(target(0));
  for (let i = 0; i < 300; i++) {
    const noise = .003 * Math.sin(i * 2.1) + .001 * Math.cos(i * 1.2);
    filter.setTarget(target(noise, noise * 3));
    const { p, q } = read(filter.update(1 / 60));
    if (i > 60) { inputEnergy += noise ** 2; positionEnergy += p.x ** 2; rotationEnergy += q.angleTo(new Quaternion()) ** 2; }
  }
  assert.ok(Math.sqrt(positionEnergy / inputEnergy) < .4, 'position RMS jitter should fall by more than 60%');
  assert.ok(Math.sqrt(rotationEnergy / (inputEnergy * 9)) < .4, 'orientation RMS jitter should fall by more than 60%');
});
test('deliberate movement catches up at 30, 60, and 120 render frames per second', () => {
  for (const fps of [30, 60, 120]) {
    const filter = new PoseSmoother(settings);
    filter.setTarget(target(0)); filter.setTarget(target(.5, Math.PI / 4));
    for (let i = 0; i < Math.ceil(.12 * fps); i++) filter.update(1 / fps);
    const { p, q } = read(filter.matrix);
    assert.ok(p.x > .45, `${fps}fps: follow at least 90% of a deliberate move within 120ms`);
    assert.ok(q.angleTo(read(target(.5, Math.PI / 4)).q) < .08, `${fps}fps: rotation should also catch up`);
  }
});
test('first acquisition and reacquisition snap into place instead of flying from the old pose', () => {
  const filter = new PoseSmoother(settings);
  const first = target(.4, .5); filter.setTarget(first);
  assert.ok(read(filter.matrix).p.distanceTo(read(first).p) < 1e-9);
  filter.reset(); const next = target(-.7, -.8); filter.setTarget(next);
  assert.ok(read(filter.matrix).p.distanceTo(read(next).p) < 1e-9);
  assert.ok(read(filter.matrix).q.angleTo(read(next).q) < 1e-7);
});
test('smoothing behaves consistently in normalized and pixel-sized target spaces', () => {
  const a = new PoseSmoother(settings), b = new PoseSmoother(settings);
  a.setTarget(target(0)); b.setTarget(target(0, 0, 960));
  for (let i = 0; i < 60; i++) {
    const x = Math.sin(i * .4) * .01;
    a.setTarget(target(x)); b.setTarget(target(x, 0, 960));
    a.update(1 / 60); b.update(1 / 60);
  }
  assert.ok(Math.abs(read(a.matrix).p.x - read(b.matrix).p.x / 960) < 1e-9);
});
