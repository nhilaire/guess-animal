import { GAME_DATA } from '../game/data.generated';
import { MAX_QUESTIONS } from '../game/inference';
import { play, yesNoAnswersOnPerfectPath } from '../game/simulate';

const data = GAME_DATA;
const all = data.animals.map((_, i) => i);

describe('perfect player on the real data (AC-11)', () => {
  const results = all.map((i) => ({ id: data.animals[i].id, ...play(data, i) }));

  it('finds every animal on the first proposal within 20 questions', () => {
    const bad = results.filter((r) => !r.found || r.proposals !== 1 || r.firstProposalAt > MAX_QUESTIONS);
    expect(bad).toEqual([]);
  });

  it('needs at most 15 questions on average', () => {
    const avg = results.reduce((s, r) => s + r.firstProposalAt, 0) / results.length;
    console.log(`perfect player: average ${avg.toFixed(2)} questions, max ${Math.max(...results.map((r) => r.firstProposalAt))}`);
    expect(avg).toBeLessThanOrEqual(15);
  });
});

describe('player with one wrong answer (AC-12)', () => {
  it('finds the animal within 3 proposals in at least 90 % of the cases', () => {
    let cases = 0;
    let found = 0;
    const misses: string[] = [];
    for (const i of all) {
      const n = Math.min(10, yesNoAnswersOnPerfectPath(data, i));
      for (let k = 0; k < n; k++) {
        cases++;
        const r = play(data, i, k);
        if (r.found) found++;
        else misses.push(`${data.animals[i].id}#${k}`);
      }
    }
    const rate = found / cases;
    console.log(`one wrong answer: ${found}/${cases} = ${(rate * 100).toFixed(1)} %; misses: ${misses.slice(0, 40).join(' ')}`);
    expect(rate).toBeGreaterThanOrEqual(0.9);
  });
});
