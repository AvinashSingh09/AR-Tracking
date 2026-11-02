import * as THREE from 'three';
import { content } from './config';

export function createScene() {
  const root = new THREE.Group();
  let resolveReady!: () => void;
  let rejectReady!: (error: unknown) => void;
  const ready = new Promise<void>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  const texture = new THREE.TextureLoader().load(content.overlay, () => resolveReady(), undefined, rejectReady);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false });
  const geometry = new THREE.PlaneGeometry(1, 1 / content.aspect);
  // The anchor is the target center, in target-width units. Keeping the image
  // centered at z=0 aligns all four edges with the physical background artwork.
  root.add(new THREE.Mesh(geometry, material));
  return {
    root,
    ready,
    dispose() { geometry.dispose(); material.dispose(); texture.dispose(); },
  };
}
