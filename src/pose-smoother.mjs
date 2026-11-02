import { Matrix4, Quaternion, Vector3 } from 'three';

/** Smooth rigid poses in render time, independent of tracker/render frequency. */
export class PoseSmoother {
  constructor({ stationaryHalfLife, movingHalfLife, translationResponse, rotationResponse }) {
    this.settings = { stationaryHalfLife, movingHalfLife, translationResponse, rotationResponse };
    this.matrix = new Matrix4();
    this.position = new Vector3(); this.rotation = new Quaternion(); this.scale = new Vector3();
    this.targetPosition = new Vector3(); this.targetRotation = new Quaternion(); this.targetScale = new Vector3();
    this.initialized = false;
  }

  reset() { this.initialized = false; }

  setTarget(matrix) {
    matrix.decompose(this.targetPosition, this.targetRotation, this.targetScale);
    this.targetRotation.normalize();
    if (!this.initialized) {
      this.position.copy(this.targetPosition);
      this.rotation.copy(this.targetRotation);
      this.scale.copy(this.targetScale);
      this.matrix.compose(this.position, this.rotation, this.scale);
      this.initialized = true;
    }
  }

  update(deltaSeconds) {
    if (!this.initialized) return this.matrix;
    const { stationaryHalfLife, movingHalfLife, translationResponse, rotationResponse } = this.settings;
    // Normalize translation against the anchor's image width, not camera pixels.
    const imageWidth = Math.max(Math.abs(this.targetScale.x), 1e-6);
    const translation = this.position.distanceTo(this.targetPosition) / (imageWidth * translationResponse);
    const rotation = this.rotation.angleTo(this.targetRotation) / rotationResponse;
    // Small fluctuations receive stronger damping; real movement catches up quickly.
    const movement = Math.min(1, Math.max(translation, rotation));
    const halfLife = stationaryHalfLife + (movingHalfLife - stationaryHalfLife) * movement;
    const alpha = 1 - Math.exp(-Math.LN2 * Math.max(0, deltaSeconds) / halfLife);
    this.position.lerp(this.targetPosition, alpha);
    this.rotation.slerp(this.targetRotation, alpha);
    this.scale.lerp(this.targetScale, alpha);
    // Quaternion interpolation preserves a rigid rotation; averaging matrix entries doesn't.
    this.matrix.compose(this.position, this.rotation, this.scale);
    return this.matrix;
  }
}
