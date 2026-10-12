// Deterministic mode (tests and e2e flows): the engine always asks the best question. In-memory only, never saved;
// switched on by opening the deep link guessanimal://deterministic, cleared when the app process ends.
let deterministic = false;

export const DETERMINISTIC_LINK = 'guessanimal://deterministic';

export function isDeterministic(): boolean {
  return deterministic;
}

export function setDeterministic(on: boolean): void {
  deterministic = on;
}

// Returns true when the URL is the deterministic-mode link (and switches the mode on).
export function handleLink(url: string | null | undefined): boolean {
  if (!url || !url.toLowerCase().startsWith(DETERMINISTIC_LINK)) return false;
  deterministic = true;
  return true;
}

// Seed for a new game: none in deterministic mode, a random 32-bit seed otherwise.
export function newSeed(random: () => number = Math.random): number | undefined {
  return deterministic ? undefined : Math.floor(random() * 4294967296);
}
