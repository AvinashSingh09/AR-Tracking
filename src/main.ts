import './style.css';
import { content } from './config';

document.querySelector('#app')!.innerHTML = [
  '<main id="landing"><button id="start" type="button">Start</button><p id="error" role="alert" hidden></p></main>',
  '<section id="scanner" aria-label="Image target scanner" hidden><div id="viewport"></div>',
  '<button id="exit" type="button" aria-label="Exit camera">×</button>',
  '<button id="sound" type="button" aria-label="Turn sound on" aria-pressed="false" hidden>Sound off</button>',
  '<div id="feedback"><p id="status" role="status" aria-live="polite"></p>',
  '<button id="play" type="button" hidden>Tap to play</button></div></section>',
].join('');

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
let frame: HTMLIFrameElement | undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;
let enteredFullscreen = false;
let playCommand = 'play';

function status(message: string) {
  $('status').textContent = message;
  $('status').hidden = !message;
}
function stop() {
  clearTimeout(timeout);
  frame?.contentWindow?.postMessage({ type: 'stop' }, location.origin);
  frame?.remove(); frame = undefined;
  $('scanner').hidden = true; $('landing').hidden = false; $('play').hidden = true;
  $('sound').hidden = true;
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
  $('landing').hidden = true; $('scanner').hidden = false; $('play').hidden = true;
  $('sound').hidden = true; $('sound').textContent = 'Sound off';
  $('sound').setAttribute('aria-label', 'Turn sound on'); $('sound').setAttribute('aria-pressed', 'false');
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
  if (type === 'ready' || type === 'lost') { clearTimeout(timeout); status(content.scanHint); $('sound').hidden = true; }
  if (type === 'found') { clearTimeout(timeout); status(''); $('sound').hidden = false; }
  if (type === 'sound') {
    const muted = e.data.muted;
    $('sound').textContent = muted ? 'Sound off' : 'Sound on';
    $('sound').setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
    $('sound').setAttribute('aria-pressed', String(!muted));
  }
  if (type === 'playing') { $('play').hidden = true; status(''); }
  if (type === 'buffering') status('Loading video…');
  if (type === 'blocked' || type === 'ended' || type === 'media-error') {
    playCommand = type === 'blocked' ? 'play' : 'replay';
    $('play').textContent = type === 'blocked' ? 'Tap to play' : 'Replay';
    $('play').hidden = false;
    status(type === 'media-error' ? 'Video could not load. Tap Replay to try again.' : '');
  }
  if (type === 'error') fail(message);
});
$('play').addEventListener('click', () => frame?.contentWindow?.postMessage({ type: playCommand }, location.origin));
$('sound').addEventListener('click', () => frame?.contentWindow?.postMessage({ type: 'mute' }, location.origin));
$('exit').addEventListener('click', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden && frame) stop(); });
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === $('scanner')) enteredFullscreen = true;
  else if (enteredFullscreen && frame) stop();
});
addEventListener('pagehide', stop);
