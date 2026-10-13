import { GAME_DATA } from '../game/data.generated';
import { MAX_QUESTIONS, newGame } from '../game/inference';
import { play, playNoisy, yesNoAnswersOnPerfectPath } from '../game/simulate';

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
  it('over 20 seeds the opening question takes at least 4 different values', () => {
    const openings = new Set(Array.from({ length: 20 }, (_, k) => newGame(data, 1000 + k).current));
    console.log(`opening questions over 20 seeds: ${[...openings].map((q) => data.questions[q].id).join(', ')}`);
    expect(openings.size).toBeGreaterThanOrEqual(4);
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

describe('player with 10 % wrong answers (AC-34, v0.2.0)', () => {
  it('finds the animal within 3 proposals in >= 93 % of games, never two proposals in a row', () => {
    let state = 2024;
    const random = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };
    let games = 0;
    let found = 0;
    let firstTry = 0;
    let questions = 0;
    let inARow = 0;
    for (let rep = 0; rep < 2; rep++) {
      for (const i of all) {
        const r = playNoisy(data, i, 0.1, random, 500 + rep * 1000 + i);
        games++;
        if (r.found) {
          found++;
          questions += r.questions;
          if (r.proposals === 1) firstTry++;
        }
        inARow += r.proposalsInARow;
      }
    }
    console.log(`10 % wrong answers: found ${found}/${games} = ${((100 * found) / games).toFixed(1)} %, first try ${((100 * firstTry) / games).toFixed(1)} %, ${(questions / found).toFixed(1)} questions, proposals in a row: ${inARow}`);
    expect(found / games).toBeGreaterThanOrEqual(0.93);
    expect(inARow).toBe(0);
  });
});
