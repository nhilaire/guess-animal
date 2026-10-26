#!/usr/bin/env node
// Text-to-speech with the Azure Speech REST API (free tier F0). Local tool, never used by the app at runtime.
// The key and region come from user environment variables AZURE_SPEECH_KEY / AZURE_SPEECH_REGION and are never
// printed or written anywhere.
//
//   node scripts/tts.mjs --samples            # a few sentences with 3 voices into .voice-samples/ (git-ignored)
//   import { synthesize } from './tts.mjs'     # used by scripts/generate-audio.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_VOICE = 'fr-FR-DeniseNeural';
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

function credentials() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be set (user environment variables)');
  return { key, region };
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function synthesize(text, outFile, voice = DEFAULT_VOICE) {
  const { key, region } = credentials();
  // The SSML language is the voice locale (fr-FR-DeniseNeural -> fr-FR).
  const lang = voice.split('-').slice(0, 2).join('-');
  const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${voice}">${escapeXml(text)}</voice></speak>`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'guess-animal-audio-generator',
      },
      body: ssml,
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`audio too small for "${text}"`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, buf);
      return buf.length;
    }
    if (res.status === 429 && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * attempt)); // F0 rate limit
      continue;
    }
    throw new Error(`Azure Speech HTTP ${res.status} for "${text}"`);
  }
  throw new Error('unreachable');
}

async function samples() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const text = "Pense à un animal… je vais le deviner ! Est-ce qu'il vit dans l'eau ? Est-ce que c'est la girafe ? J'ai trouvé !";
  for (const voice of ['fr-FR-DeniseNeural', 'fr-FR-EloiseNeural', 'fr-FR-HenriNeural', 'fr-FR-VivienneMultilingualNeural']) {
    const out = path.join(root, '.voice-samples', `${voice}.mp3`);
    const size = await synthesize(text, out, voice);
    console.log(`${voice}: ${out} (${size} bytes)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--samples')) {
    samples().catch((err) => {
      console.error(`tts: ${err.message}`);
      process.exit(1);
    });
  } else {
    console.error('usage: node scripts/tts.mjs --samples');
    process.exit(2);
  }
}
