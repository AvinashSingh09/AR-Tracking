import * as THREE from 'three';
import { Controller } from 'mind-ar/dist/mindar-image.prod.js';
import { createScene } from './scene';
import { content, tracking } from './config';
import { cameraMessage } from './policy.mjs';
import { PoseSmoother } from './pose-smoother.mjs';

const send = (type: string, data: object = {}) => parent.postMessage({ source: 'ar-invite', type, ...data }, location.origin);
const abort = new AbortController();
let disposed = false, tracked = false, controller: any;
let stream: MediaStream | undefined, width = 1, height = 1;
const cameraVideo = document.createElement('video');
cameraVideo.muted = true; cameraVideo.autoplay = true; cameraVideo.playsInline = true;
document.body.append(cameraVideo);
const world = createScene();
const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera();
const root = new THREE.Group(); root.matrixAutoUpdate = false; root.visible = false; root.add(world.root); scene.add(root);
const pose = new PoseSmoother(tracking.smoothing);
const measuredPose = new THREE.Matrix4();
const targetToAnchor = new THREE.Matrix4();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); document.body.append(renderer.domElement);
const clock = new THREE.Clock();
function resize() {
  if (!controller) return;
  const w = innerWidth, h = innerHeight;
  const scale = Math.max(w / cameraVideo.videoWidth, h / cameraVideo.videoHeight);
  const vw = cameraVideo.videoWidth * scale, vh = cameraVideo.videoHeight * scale;
  Object.assign(cameraVideo.style, { width: `${vw}px`, height: `${vh}px`, left: `${(w-vw)/2}px`, top: `${(h-vh)/2}px` });
  const p = controller.getProjectionMatrix();
  camera.fov = 2 * Math.atan(1 / p[5] * h / vh) * 180 / Math.PI;
  camera.near = p[14] / (p[10] - 1); camera.far = p[14] / (p[10] + 1);
  camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
}
function stop() {
  if (disposed) return; disposed = true; abort.abort();
  stream?.getTracks().forEach(t => t.stop());
  controller?.stopProcessVideo();
  // Resolve in-flight worker waits before terminating its isolated runtime.
  controller?.workerMatchDone?.({ targetIndex: -1, modelViewTransform: null });
  controller?.workerTrackDone?.({ modelViewTransform: null });
  controller?.worker?.terminate();
  renderer.setAnimationLoop(null); world.dispose(); renderer.dispose();
  cameraVideo.srcObject = null;
}
addEventListener('pagehide', stop);
addEventListener('resize', resize);
addEventListener('message', e => {
  if (e.origin !== location.origin || e.source !== parent || disposed) return;
  if (e.data.type === 'stop') { stop(); return; }
});
async function start() {
  try {
    if (!isSecureContext || !navigator.mediaDevices) throw new Error('Camera needs HTTPS or localhost.');
    send('status', { message: 'Loading invitation…' });
    try { await world.ready; }
    catch {
      if (!disposed) { stop(); send('error', { message: 'The invitation image could not load. Check your connection and try again.' }); }
      return;
    }
    if (disposed) return;
    send('status', { message: 'Opening your camera…' });
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (disposed) { stream.getTracks().forEach(t => t.stop()); return; }
    cameraVideo.srcObject = stream;
    await cameraVideo.play();
    if (disposed) return;
    cameraVideo.width = cameraVideo.videoWidth; cameraVideo.height = cameraVideo.videoHeight;
    send('status', { message: 'Preparing image tracking…' });
    controller = new Controller({ inputWidth: cameraVideo.videoWidth, inputHeight: cameraVideo.videoHeight, maxTrack: 1, ...tracking.sdk,
      onUpdate: (data: any) => {
        if (disposed || data.type !== 'updateMatrix') return;
        const found = data.worldMatrix !== null;
        root.visible = found;
        // MindAR republishes its cached pose during tolerated tracking misses.
        // Do not feed those cached samples back into presentation smoothing.
        if (found && controller.trackingStates[data.targetIndex]?.isTracking) {
          measuredPose.fromArray(data.worldMatrix).multiply(targetToAnchor);
          pose.setTarget(measuredPose);
        } else if (!found) pose.reset();
        if (found !== tracked) { tracked = found; send(found ? 'found' : 'lost'); }
      }
    });
    const response = await fetch(content.target, { signal: abort.signal });
    if (!response.ok) throw new Error('Target could not load.');
    const buffer = await response.arrayBuffer();
    if (disposed) return;
    const { dimensions } = controller.addImageTargetsFromBuffer(buffer);
    [width, height] = dimensions[0];
    targetToAnchor.compose(new THREE.Vector3(width / 2, height / 2, 0), new THREE.Quaternion(), new THREE.Vector3(width, width, width));
    resize(); controller.dummyRun(cameraVideo);
    if (disposed) return;
    controller.processVideo(cameraVideo);
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      if (root.visible) root.matrix.copy(pose.update(delta));
      renderer.render(scene, camera);
    });
    send('ready');
  } catch (error) { if (!disposed) { stop(); send('error', { message: cameraMessage(error) }); } }
}
renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); send('error', { message: 'The graphics session stopped. Please try again.' }); });
void start();
