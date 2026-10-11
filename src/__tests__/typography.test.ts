import { GAME_DATA } from '../game/data.generated';
import { fr } from '../i18n/fr';
import { typographyProblems } from '../i18n/typography';

// Collects every player-facing string of fr.ts (functions are called with a sample argument).
function strings(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') out.push(node);
  else if (typeof node === 'function') out.push(String((node as (x: unknown) => unknown)(node.length ? 'la girafe' : undefined)));
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => strings(v, out));
  return out;
}

describe('French typography (AC-27)', () => {
  it('detects a missing no-break space', () => {
    expect(typographyProblems(['Oui ?', 'Oui ?'])).toHaveLength(1);
  });

  it('fr.ts strings use no-break spaces', () => {
    const texts = strings(fr);
    expect(texts.length).toBeGreaterThan(20);
    expect(typographyProblems(texts)).toEqual([]);
  });

  it('question texts and proposal sentences use no-break spaces', () => {
    const texts = [...GAME_DATA.questions.map((q) => q.text), ...GAME_DATA.animals.map((a) => fr.proposal.question(a.spoken))];
    expect(typographyProblems(texts)).toEqual([]);
  });
});
