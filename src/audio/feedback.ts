// Sound and haptic feedback used by the game screens. The implementation is installed by `setFeedback`
// (expo-audio / expo-haptics in the app, a recording fake in tests). Default: silent.
import type { Language } from '../i18n';

export type Line = 'pitch' | 'victory' | 'giveUp' | 'giveUpBody' | 'thanks';
export type Effect = 'win' | 'lose';

export type Feedback = {
  // Voice clips are spoken in the given language (the game's language).
  question(questionId: string, language: Language): void;
  proposal(animalId: string, language: Language): void;
  line(line: Line, language: Language): void;
  then(line: Line, language: Language): void; // plays after the current clip ends
  effect(effect: Effect): void;
  vibrate(): void;
  stop(): void;
};

const silent: Feedback = {
  question: () => {},
  proposal: () => {},
  line: () => {},
  then: () => {},
  effect: () => {},
  vibrate: () => {},
  stop: () => {},
};

let current: Feedback = silent;

export function setFeedback(f: Feedback | null): void {
  current = f ?? silent;
}

export function feedback(): Feedback {
  return current;
}
