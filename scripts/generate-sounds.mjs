#!/usr/bin/env node
// Synthesises the two sound effects (self-made, no sample): assets/sounds/win.wav and lose.wav.
//   node scripts/generate-sounds.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RATE = 22050;

// notes: [frequency Hz, duration s]; soft attack/decay envelope, a touch of the octave for brightness.
function render(notes, volume = 0.35) {
  const samples = [];
  for (const [f, d] of notes) {
    const n = Math.round(d * RATE);
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const env = Math.min(1, i / (0.01 * RATE)) * Math.exp(-3 * (t / d));
      samples.push(volume * env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) / 1.3);
    }
  }
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, A4 = 440, F4 = 349.23, D4 = 293.66;
const out = path.join(ROOT, 'assets', 'sounds');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'win.wav'), render([[C5, 0.12], [E5, 0.12], [G5, 0.12], [C6, 0.45]]));
fs.writeFileSync(path.join(out, 'lose.wav'), render([[A4, 0.2], [F4, 0.2], [D4, 0.5]]));
console.log('wrote assets/sounds/win.wav, lose.wav');
