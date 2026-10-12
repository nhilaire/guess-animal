import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { GAME_DATA } from '../game/data.generated';
import { GENERIC_NAMES, closePairs, structuralProblems } from '../game/validate';

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
