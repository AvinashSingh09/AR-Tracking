import { loadImage } from 'canvas';
import * as tf from '@tensorflow/tfjs';
import { OfflineCompiler } from 'mind-ar/src/image-target/offline-compiler.js';
import { writeFile, readFile } from 'node:fs/promises';
await tf.setBackend('cpu');
await tf.ready();
const compiler = new OfflineCompiler();
let last = -1;
await compiler.compileImageTargets([await loadImage('public/content/card-v1/target.jpg')], progress => {
  const step = Math.floor(progress / 10);
  if (step !== last) { console.log(`Compiling: ${step * 10}%`); last = step; }
});
await writeFile('public/content/card-v1/target.mind', Buffer.from(compiler.exportData()));
const summary = JSON.parse(await readFile('docs/target-preparation.json', 'utf8'));
summary.compiler = 'mind-ar 1.2.5 OfflineCompiler; CPU; @napi-rs/canvas 0.1.80';
summary.featureSummary = compiler.data.map(d => ({
  matching: d.matchingData.map(l => ({ maxima: l.maximaPoints?.length, minima: l.minimaPoints?.length })),
  tracking: d.trackingData.map(l => ({ width: l.width, height: l.height, points: l.points?.length }))
}));
await writeFile('docs/target-preparation.json', JSON.stringify(summary, null, 2));
console.log('Saved compiled target and feature summary.');
