// Sound and haptic feedback used by the game screens. The implementation is installed by `setFeedback`
// (expo-audio / expo-haptics in the app, a recording fake in tests). Default: silent.
export type Line = 'pitch' | 'victory' | 'giveUp' | 'giveUpBody' | 'thanks';
export type Effect = 'win' | 'lose';

export type Feedback = {
  question(questionId: string): void;
  proposal(animalId: string): void;
  line(line: Line): void;
  effect(effect: Effect): void;
  vibrate(): void;
  stop(): void;
};

const silent: Feedback = {
  question: () => {},
  proposal: () => {},
  line: () => {},
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
