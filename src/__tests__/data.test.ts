import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { GAME_DATA, GAME_DATA_EN } from '../game/data.generated';
import { GENERIC_NAMES, GENERIC_NAMES_BY_LANGUAGE, closePairs, structuralProblems } from '../game/validate';

const ROOT = path.resolve(__dirname, '..', '..');

describe('animal data', () => {
  it('generated TypeScript is in sync with data/*.csv', () => {
    expect(() => execFileSync('node', ['scripts/build-data.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' })).not.toThrow();
  });

  it('review sheet docs/DATA-REVIEW.md is in sync with the data (AC-29)', () => {
    expect(() => execFileSync('node', ['scripts/data-review.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' })).not.toThrow();
  });

  it('is complete, unique, well-formed, 215-235 animals and 110-120 questions (AC-03)', () => {
    expect(structuralProblems(GAME_DATA)).toEqual([]);
    expect(GAME_DATA.animals.length).toBeGreaterThanOrEqual(215);
    expect(GAME_DATA.animals.length).toBeLessThanOrEqual(235);
  });

  it('every pair of animals differs on at least 2 yes/no questions (AC-04)', () => {
    expect(closePairs(GAME_DATA)).toEqual([]);
  });

  it('contains no generic animal (AC-05)', () => {
    const names = GAME_DATA.animals.map((a) => a.name);
    for (const g of GENERIC_NAMES) expect(names).not.toContain(g);
  });
});

describe('English data (AC-05, AC-38)', () => {
  it('has the same ids, facts and emoji as the French data, with an English text for every question and animal', () => {
    expect(GAME_DATA_EN.questions.map((q) => q.id)).toEqual(GAME_DATA.questions.map((q) => q.id));
    expect(GAME_DATA_EN.animals.map((a) => [a.id, a.emoji, a.facts.join('')])).toEqual(GAME_DATA.animals.map((a) => [a.id, a.emoji, a.facts.join('')]));
    expect(structuralProblems(GAME_DATA_EN, 'en')).toEqual([]);
  });

  it('every spoken name starts with « a » or « an », as English pronunciation wants', () => {
    const wrong = GAME_DATA_EN.animals.filter((a) => {
      const [article, word] = a.spoken.split(' ');
      return article !== (/^[aeiou]/i.test(word) ? 'an' : 'a');
    });
    expect(wrong.map((a) => a.spoken)).toEqual([]);
  });

  it('is really English: no question or name left in French', () => {
    const frenchTexts = new Set([...GAME_DATA.questions.map((q) => q.text), ...GAME_DATA.animals.map((a) => a.spoken)]);
    const left = [...GAME_DATA_EN.questions.map((q) => q.text), ...GAME_DATA_EN.animals.map((a) => a.spoken)].filter((t) => frenchTexts.has(t));
    expect(left).toEqual([]);
    expect(GAME_DATA_EN.questions.every((q) => q.text.endsWith('?') && !/[  ]/.test(q.text))).toBe(true);
  });

  it('contains no generic English animal', () => {
    const names = GAME_DATA_EN.animals.map((a) => a.name);
    for (const g of GENERIC_NAMES_BY_LANGUAGE.en) expect(names).not.toContain(g);
  });
});
