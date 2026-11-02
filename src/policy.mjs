// Keep guest intent independent from temporary tracking/session interruptions.
export function shouldPlay({ active, tracked, playing, ended }) {
  return active && tracked && playing && !ended;
}
export function cameraMessage(error) {
  if (error?.name === 'NotAllowedError') return 'Camera access is off. Enable it in your browser settings, or watch the demo below.';
  if (error?.name === 'NotFoundError') return 'No camera was found. You can still watch the demo below.';
  if (error?.name === 'NotReadableError') return 'The camera is busy. Close other camera apps and try again.';
  return 'AR could not start. Try again or watch the demo below.';
}
