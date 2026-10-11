import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { VOICE } from '../audio/manifest.generated';
import { GAME_DATA } from '../game/data.generated';
import { fr } from '../i18n/fr';
import { typographyProblems } from '../i18n/typography';

const ROOT = path.resolve(__dirname, '..', '..');

describe('voice files (AC-13)', () => {
  it('every clip file exists and the manifest is up to date', () => {
    expect(() => execFileSync('node', ['scripts/generate-audio.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' })).not.toThrow();
  });

  it('has a clip for every question, with the displayed text', () => {
    for (const q of GAME_DATA.questions) expect(VOICE.questions[q.id]?.text).toBe(q.text);
    expect(Object.keys(VOICE.questions)).toHaveLength(GAME_DATA.questions.length);
  });

  it('has a proposal clip for every animal, with the displayed sentence', () => {
    for (const a of GAME_DATA.animals) expect(VOICE.proposals[a.id]?.text).toBe(fr.proposal.question(a.spoken));
    expect(Object.keys(VOICE.proposals)).toHaveLength(GAME_DATA.animals.length);
  });

  it('has the fixed sentences, equal to the French copy', () => {
    expect(VOICE.lines.pitch.text).toBe(fr.home.pitch);
    expect(VOICE.lines.victory.text).toBe(fr.victory.title);
    expect(VOICE.lines.giveUp.text).toBe(fr.giveUp.title);
    expect(VOICE.lines.giveUpBody.text).toBe(fr.giveUp.body);
    expect(VOICE.lines.thanks.text).toBe(fr.thanks.body);
  });

  it('spoken texts follow French typography (AC-27)', () => {
    const texts = [VOICE.questions, VOICE.proposals, VOICE.lines].flatMap((g) => Object.values(g).map((c) => c.text));
    expect(typographyProblems(texts)).toEqual([]);
  });
});
