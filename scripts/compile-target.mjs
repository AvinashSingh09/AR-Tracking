import { loadImage } from 'canvas';
import * as tf from '@tensorflow/tfjs';
import { OfflineCompiler } from 'mind-ar/src/image-target/offline-compiler.js';
import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const imagePath = process.argv[2] || 'public/content/card-v2/target.png';
const targetPath = imagePath.replace(/\.[^.]+$/, '.mind');
const summaryPath = process.argv[3] || 'docs/target-v2-preparation.json';
await tf.setBackend('cpu');
await tf.ready();
const compiler = new OfflineCompiler();
let last = -1;
await compiler.compileImageTargets([await loadImage(imagePath)], progress => {
  const step = Math.floor(progress / 10);
  if (step !== last) { console.log(`Compiling: ${step * 10}%`); last = step; }
});
const compiled = Buffer.from(compiler.exportData());
await writeFile(targetPath, compiled);
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
summary.imageSha256 = createHash('sha256').update(await readFile(imagePath)).digest('hex');
summary.compiledSha256 = createHash('sha256').update(compiled).digest('hex');
summary.trackingPoints = compiler.data[0].trackingData.map(level => level.points.length);
summary.compiler = 'mind-ar 1.2.5 OfflineCompiler; CPU; @napi-rs/canvas 0.1.80';
summary.featureSummary = compiler.data.map(d => ({
  matching: d.matchingData.map(l => ({ maxima: l.maximaPoints?.length, minima: l.minimaPoints?.length })),
  tracking: d.trackingData.map(l => ({ width: l.width, height: l.height, points: l.points?.length }))
}));
await writeFile(summaryPath, JSON.stringify(summary, null, 2));
console.log('Saved compiled target and feature summary.');
