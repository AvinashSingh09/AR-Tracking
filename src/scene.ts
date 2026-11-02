import * as THREE from 'three';
import { content } from './config';

export function createScene(video: HTMLVideoElement, includeCard = false) {
  const root = new THREE.Group();
  const sculpture = new THREE.Group();
  sculpture.position.set(-0.19, -0.10, 0.23);
  const gold = new THREE.MeshStandardMaterial({ color: 0xdab878, metalness: .68, roughness: .28 });
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.11, 0), gold);
  sculpture.add(orb);
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.17 + i * .035, .005, 8, 80), gold);
    ring.rotation.set(i ? .8 : -.5, i ? .6 : 1, 0);
    sculpture.add(ring);
  }
  root.add(sculpture);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, .025, 48), gold);
  base.rotation.x = Math.PI / 2; base.position.set(-.19, -.10, .013); root.add(base);
  const texture = new THREE.VideoTexture(video); texture.colorSpace = THREE.SRGBColorSpace;
  const poster = new THREE.TextureLoader().load(content.poster); poster.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: poster, side: THREE.DoubleSide });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(.86, .86 / content.videoAspect), material);
  // Face the same viewing side as an upright visiting card. The previous 90°
  // rotation put the screen edge-on and amplified small pitch errors.
  panel.position.set(0, .58, .06); root.add(panel);
  if (includeCard) {
    const card = new THREE.TextureLoader().load(content.image); card.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / content.aspect), new THREE.MeshBasicMaterial({ map: card, side: THREE.DoubleSide }));
    root.add(mesh);
  }
  root.add(new THREE.HemisphereLight(0xffffff, 0x42515c, 2.8));
  const light = new THREE.DirectionalLight(0xffe2a8, 3); light.position.set(1, -1, 3); root.add(light);
  let time = 0;
  return {
    root,
    update(delta: number, playing: boolean) {
      if (playing) { time += Math.min(delta, .05); sculpture.rotation.z = time * .35; orb.rotation.y = time * .6; }
      const map = video.readyState >= 2 && !video.error ? texture : poster;
      if (material.map !== map) { material.map = map; material.needsUpdate = true; }
    },
    replay() { time = 0; },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const maps = new Set<THREE.Texture>([texture, poster]);
      root.traverse(o => { if (o instanceof THREE.Mesh) { geometries.add(o.geometry); for (const m of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(m); if (m.map) maps.add(m.map); } } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); maps.forEach(m => m.dispose());
    }
  };
}
