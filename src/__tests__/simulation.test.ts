import { GAME_DATA } from '../game/data.generated';
import { MAX_QUESTIONS, newGame } from '../game/inference';
import { play, yesNoAnswersOnPerfectPath } from '../game/simulate';

const data = GAME_DATA;
const all = data.animals.map((_, i) => i);
// Deterministic mode (no seed) and 5 fixed seeds of variety mode (PRD "Quality targets").
const MODES: { name: string; seed?: number }[] = [{ name: 'deterministic' }, ...[11, 22, 33, 44, 55].map((seed) => ({ name: `seed ${seed}`, seed }))];

describe.each(MODES)('perfect player, $name (AC-11)', ({ name, seed }) => {
  const results = all.map((i) => ({ id: data.animals[i].id, ...play(data, i, -1, seed) }));

  it('finds every animal on the first proposal within 20 questions', () => {
    const bad = results.filter((r) => !r.found || r.proposals !== 1 || r.firstProposalAt > MAX_QUESTIONS);
    expect(bad).toEqual([]);
  });

  it('needs at most 15 questions on average', () => {
    const avg = results.reduce((s, r) => s + r.firstProposalAt, 0) / results.length;
    console.log(`perfect player (${name}): average ${avg.toFixed(2)} questions, max ${Math.max(...results.map((r) => r.firstProposalAt))}`);
    expect(avg).toBeLessThanOrEqual(15);
  });
});

describe.each(MODES)('player with one wrong answer, $name (AC-12)', ({ name, seed }) => {
  it('finds the animal within 3 proposals in at least 90 % of the cases', () => {
    let cases = 0;
    let found = 0;
    const misses: string[] = [];
    for (const i of all) {
      const n = Math.min(10, yesNoAnswersOnPerfectPath(data, i, seed));
      for (let k = 0; k < n; k++) {
        cases++;
        const r = play(data, i, k, seed);
        if (r.found) found++;
        else misses.push(`${data.animals[i].id}#${k}`);
      }
    }
    const rate = found / cases;
    console.log(`one wrong answer (${name}): ${found}/${cases} = ${(rate * 100).toFixed(1)} %; misses: ${misses.slice(0, 20).join(' ')}`);
    expect(rate).toBeGreaterThanOrEqual(0.9);
  });
});

describe('variety on the real data (AC-31)', () => {
  it('over 20 seeds the opening question takes at least 2 different values', () => {
    const openings = new Set(Array.from({ length: 20 }, (_, k) => newGame(data, 1000 + k).current));
    console.log(`opening questions over 20 seeds: ${[...openings].map((q) => data.questions[q].id).join(', ')}`);
    expect(openings.size).toBeGreaterThanOrEqual(2);
  });
});

describe('engine speed (AC-32)', () => {
  it('chooses the next question in < 100 ms (median of 20 runs) at the start of a game', () => {
    const times = Array.from({ length: 20 }, (_, k) => {
      const t0 = performance.now();
      newGame(data, k + 1);
      return performance.now() - t0;
    }).sort((a, b) => a - b);
    const median = times[10];
    console.log(`next question at game start: median ${median.toFixed(2)} ms`);
    expect(median).toBeLessThan(100);
  });
});
