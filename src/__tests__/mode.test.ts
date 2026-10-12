import { handleLink, isDeterministic, newSeed, setDeterministic } from '../game/mode';

describe('deterministic mode (AC-33)', () => {
  afterEach(() => setDeterministic(false));

  it('is off by default: each game gets a seed', () => {
    expect(isDeterministic()).toBe(false);
    expect(newSeed(() => 0.5)).toBe(2147483648);
  });

  it('is switched on only by guessanimal://deterministic', () => {
    expect(handleLink('https://example.com')).toBe(false);
    expect(handleLink(null)).toBe(false);
    expect(isDeterministic()).toBe(false);
    expect(handleLink('guessanimal://deterministic')).toBe(true);
    expect(isDeterministic()).toBe(true);
    expect(newSeed()).toBeUndefined();
  });
});
