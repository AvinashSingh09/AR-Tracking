// Keep guest intent independent from temporary tracking/session interruptions.
export function shouldPlay({ active, tracked, playing, ended }) {
  return active && tracked && playing && !ended;
}
export function cameraMessage(error) {
  if (error?.name === 'NotAllowedError') return 'Camera access is off. Enable it in your browser settings and try Start again.';
  if (error?.name === 'NotFoundError') return 'No camera was found. Open this page on a device with a camera.';
  if (error?.name === 'NotReadableError') return 'The camera is busy. Close other camera apps and try again.';
  return 'AR could not start. Check your connection and try Start again.';
}
