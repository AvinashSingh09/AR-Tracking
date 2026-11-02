import './style.css';
import { content } from './config';

document.querySelector('#app')!.innerHTML = [
  '<main id="landing"><button id="start" type="button">Start</button><p id="error" role="alert" hidden></p></main>',
  '<section id="scanner" aria-label="Image target scanner" hidden><div id="viewport"></div>',
  '<button id="exit" type="button" aria-label="Exit camera">×</button>',
  '<div id="feedback"><p id="status" role="status" aria-live="polite"></p>',
  '</div></section>',
].join('');

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
let frame: HTMLIFrameElement | undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;
let enteredFullscreen = false;
let targetFound = false;

function status(message: string) {
  $('status').textContent = message;
  $('status').hidden = !message;
}
function stop() {
  clearTimeout(timeout);
  frame?.contentWindow?.postMessage({ type: 'stop' }, location.origin);
  frame?.remove(); frame = undefined;
  $('scanner').hidden = true; $('landing').hidden = false; targetFound = false;
  enteredFullscreen = false;
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
}
function fail(message: string) {
  stop(); $('error').textContent = message; $('error').hidden = false;
}
$('start').addEventListener('click', () => {
  if (frame) return;
  $('error').hidden = true;
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    fail('Camera access requires HTTPS and a trusted certificate.'); return;
  }
  $('landing').hidden = true; $('scanner').hidden = false;
  status('Allow camera access to begin.');
  // Always fill the viewport; also hide browser chrome where supported.
  if ($('scanner').requestFullscreen) {
    void $('scanner').requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }
  frame = document.createElement('iframe');
  frame.title = 'Live camera and image AR experience';
  frame.allow = 'camera; autoplay'; frame.src = '/ar.html';
  $('viewport').replaceChildren(frame);
  timeout = setTimeout(() => {
    if (frame) fail('Camera setup is taking too long. Allow camera access, then try Start again.');
  }, 45000);
});
addEventListener('message', e => {
  if (!frame || e.origin !== location.origin || e.source !== frame.contentWindow || e.data?.source !== 'ar-invite') return;
  const { type, message } = e.data;
  if (type === 'status') status(message);
  if (type === 'lost') targetFound = false;
  if (type === 'ready' || type === 'lost') { clearTimeout(timeout); status(targetFound ? '' : content.scanHint); }
  if (type === 'found') { clearTimeout(timeout); targetFound = true; status(''); }
  if (type === 'error') fail(message);
});
$('exit').addEventListener('click', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden && frame) stop(); });
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === $('scanner')) enteredFullscreen = true;
  else if (enteredFullscreen && frame) stop();
});
addEventListener('pagehide', stop);
