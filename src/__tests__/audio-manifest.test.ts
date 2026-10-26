import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { VOICE } from '../audio/manifest.generated';
import { GAME_DATA_BY_LANGUAGE } from '../game/data.generated';
import { DICTIONARIES, LANGUAGES } from '../i18n';
import { typographyProblems } from '../i18n/typography';

const ROOT = path.resolve(__dirname, '..', '..');

describe('voice files (AC-13, AC-38)', () => {
  it('every clip file exists and the manifest is up to date', () => {
    expect(() => execFileSync('node', ['scripts/generate-audio.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' })).not.toThrow();
  });

  it.each(LANGUAGES)('%s: has a clip for every question, with the displayed text', (language) => {
    const voice = VOICE[language];
    for (const q of GAME_DATA_BY_LANGUAGE[language].questions) expect(voice.questions[q.id]?.text).toBe(q.text);
    expect(Object.keys(voice.questions)).toHaveLength(GAME_DATA_BY_LANGUAGE[language].questions.length);
  });

  it.each(LANGUAGES)('%s: has a proposal clip for every animal, with the displayed sentence', (language) => {
    const voice = VOICE[language];
    const t = DICTIONARIES[language];
    for (const a of GAME_DATA_BY_LANGUAGE[language].animals) expect(voice.proposals[a.id]?.text).toBe(t.proposal.question(a.spoken));
    expect(Object.keys(voice.proposals)).toHaveLength(GAME_DATA_BY_LANGUAGE[language].animals.length);
  });

  it.each(LANGUAGES)('%s: has the fixed sentences, equal to the copy', (language) => {
    const lines = VOICE[language].lines;
    const t = DICTIONARIES[language];
    expect(lines.pitch.text).toBe(t.home.pitch);
    expect(lines.victory.text).toBe(t.victory.title);
    expect(lines.giveUp.text).toBe(t.giveUp.title);
    expect(lines.giveUpBody.text).toBe(t.giveUp.body);
    expect(lines.thanks.text).toBe(t.thanks.body);
  });

  it('French spoken texts follow French typography (AC-27)', () => {
    const texts = [VOICE.fr.questions, VOICE.fr.proposals, VOICE.fr.lines].flatMap((g) => Object.values(g).map((c) => c.text));
    expect(typographyProblems(texts)).toEqual([]);
  });

  it('every language has its own clips: English files are the en_ ones, French files are not', () => {
    // require() of assets is mocked in Jest: the manifest source text tells which file each clip plays.
    const manifest = fs.readFileSync(path.join(ROOT, 'src', 'audio', 'manifest.generated.ts'), 'utf8');
    const [frPart, enPart] = manifest.split('\n  en: {');
    const files = (part: string) => [...part.matchAll(/assets\/voice\/([^']+)'/g)].map((m) => m[1]);
    const count = (language: 'fr' | 'en') => [VOICE[language].questions, VOICE[language].proposals, VOICE[language].lines].reduce((n, g) => n + Object.keys(g).length, 0);
    expect(files(enPart)).toHaveLength(count('en'));
    expect(files(enPart).every((file) => file.startsWith('en_'))).toBe(true);
    expect(files(frPart)).toHaveLength(count('fr'));
    expect(files(frPart).some((file) => file.startsWith('en_'))).toBe(false);
  });
});
