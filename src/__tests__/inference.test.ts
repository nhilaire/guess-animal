import {
  MAX_QUESTIONS,
  answerProposal,
  answerQuestion,
  entropy,
  expectedGain,
  newGame,
  normalise,
  undo,
} from '../game/inference';
import { Fact, GameData } from '../game/types';

// Tiny fixture: 4 questions, 5 animals.
const facts = (s: string) => s.split('') as Fact[];
const data: GameData = {
  questions: [
    { id: 'mammal', text: 'Est-ce un mammifère ?' },
    { id: 'water', text: 'Est-ce qu’il vit dans l’eau ?' },
    { id: 'big', text: 'Est-ce qu’il est grand ?' },
    { id: 'farm', text: 'Est-ce qu’il vit à la ferme ?' },
  ],
  animals: [
    { id: 'cow', name: 'Vache', spoken: 'la vache', emoji: '🐄', facts: facts('ynyy') },
    { id: 'whale', name: 'Baleine', spoken: 'la baleine', emoji: '🐋', facts: facts('yyyn') },
    { id: 'cat', name: 'Chat', spoken: 'le chat', emoji: '🐈', facts: facts('ynnv') },
    { id: 'shark', name: 'Requin', spoken: 'le requin', emoji: '🦈', facts: facts('nyyn') },
    { id: 'hen', name: 'Poule', spoken: 'la poule', emoji: '🐔', facts: facts('nnny') },
  ],
};

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 10);

describe('weights (AC-06)', () => {
  it('starts with equal weights and asks a question', () => {
    const s = newGame(data);
    expect(s.weights).toEqual([0.2, 0.2, 0.2, 0.2, 0.2]);
    expect(s.phase).toBe('question');
    expect(s.questionsAnswered).toBe(0);
  });

  it('multiplies by 0.95 / 0.05 / 0.5 then renormalises on Oui', () => {
    let s = newGame(data);
    const q = 3; // farm: y n v n y
    s = { ...s, current: q };
    s = answerQuestion(data, s, 'yes');
    const raw = [0.95, 0.05, 0.5, 0.05, 0.95].map((x) => x * 0.2);
    const sum = raw.reduce((a, b) => a + b, 0);
    raw.forEach((r, i) => close(s.weights[i], r / sum));
  });

  it('uses the complement on Non', () => {
    let s = { ...newGame(data), current: 3 };
    s = answerQuestion(data, s, 'no');
    const raw = [0.05, 0.95, 0.5, 0.95, 0.05];
    const sum = raw.reduce((a, b) => a + b, 0);
    raw.forEach((r, i) => close(s.weights[i], r / sum));
  });

  it('leaves weights unchanged on Je ne sais pas, but counts the question', () => {
    const s0 = newGame(data);
    const s = answerQuestion(data, s0, 'dontKnow');
    expect(s.weights).toEqual(s0.weights);
    expect(s.questionsAnswered).toBe(1);
    expect(s.asked[s0.current]).toBe(true);
  });

  it('normalise keeps zeros and sums to 1', () => {
    const w = normalise([2, 0, 2]);
    expect(w).toEqual([0.5, 0, 0.5]);
  });
});

describe('question choice (AC-07)', () => {
  it('computes entropy in bits', () => {
    close(entropy([0.5, 0.5]), 1);
    close(entropy([1, 0]), 0);
  });

  it('picks the unasked question with the highest expected gain', () => {
    const s = newGame(data);
    const gains = data.questions.map((_, q) => expectedGain(data, s.weights, q));
    const max = Math.max(...gains);
    const earliestBest = gains.findIndex((g) => g >= max - 1e-12);
    expect(s.current).toBe(earliestBest);
  });

  it('breaks ties with the earliest question', () => {
    const tie: GameData = {
      questions: [
        { id: 'a', text: 'A ?' },
        { id: 'b', text: 'B ?' },
      ],
      animals: [
        { id: 'x', name: 'X', spoken: 'le x', emoji: '🐾', facts: facts('yy') },
        { id: 'z', name: 'Z', spoken: 'le z', emoji: '🐾', facts: facts('nn') },
      ],
    };
    expect(newGame(tie).current).toBe(0);
  });

  it('never asks again a question answered Je ne sais pas', () => {
    let s = newGame(data);
    const first = s.current;
    s = answerQuestion(data, s, 'dontKnow');
    expect(s.phase).toBe('question');
    expect(s.current).not.toBe(first);
  });
});

describe('proposal rule (AC-08)', () => {
  it('proposes when the top weight reaches 0.85', () => {
    // Perfect answers for the cow until a proposal.
    let s = newGame(data);
    let guard = 0;
    while (s.phase === 'question' && guard++ < 10) {
      const f = data.animals[0].facts[s.current];
      s = answerQuestion(data, s, f === 'y' ? 'yes' : f === 'n' ? 'no' : 'dontKnow');
    }
    expect(s.phase).toBe('proposal');
    expect(data.animals[s.current].id).toBe('cow');
    expect(Math.max(...s.weights)).toBeGreaterThanOrEqual(0.85);
  });

  it('proposes after 20 answered questions even when unsure', () => {
    // 40 identical questions: answering Je ne sais pas never changes the weights.
    const many: GameData = {
      questions: Array.from({ length: 40 }, (_, i) => ({ id: `q${i}`, text: `Q${i} ?` })),
      animals: [
        { id: 'x', name: 'X', spoken: 'le x', emoji: '🐾', facts: Array(40).fill('y') as Fact[] },
        { id: 'z', name: 'Z', spoken: 'le z', emoji: '🐾', facts: Array(40).fill('n') as Fact[] },
      ],
    };
    let s = newGame(many);
    for (let i = 0; i < MAX_QUESTIONS; i++) {
      expect(s.phase).toBe('question');
      s = answerQuestion(many, s, 'dontKnow');
    }
    expect(s.questionsAnswered).toBe(20);
    expect(s.phase).toBe('proposal');
    expect(s.current).toBe(0); // tie on weights: earliest animal
  });

  it('proposes when no question gains more than 0.01 bit', () => {
    const same: GameData = {
      questions: [{ id: 'a', text: 'A ?' }],
      animals: [
        { id: 'x', name: 'X', spoken: 'le x', emoji: '🐾', facts: facts('y') },
        { id: 'z', name: 'Z', spoken: 'le z', emoji: '🐾', facts: facts('y') },
      ],
    };
    const s = newGame(same);
    expect(s.phase).toBe('proposal');
  });
});

describe('proposals (AC-09)', () => {
  const toProposal = (d: GameData = data) => {
    let s = newGame(d);
    while (s.phase === 'question') s = answerQuestion(d, s, 'dontKnow');
    return s;
  };

  it('ends the game when the proposal is right', () => {
    const s = answerProposal(data, toProposal(), true);
    expect(s.phase).toBe('found');
  });

  it('discards a wrong animal and continues', () => {
    const s0 = toProposal();
    const wrong = s0.current;
    const s = answerProposal(data, s0, false);
    expect(s.weights[wrong]).toBe(0);
    expect(s.discarded[wrong]).toBe(true);
    expect(s.wrongGuesses).toBe(1);
    expect(['question', 'proposal']).toContain(s.phase);
  });

  it('proposes again immediately once the 20-question cap is reached', () => {
    const many: GameData = {
      questions: Array.from({ length: 30 }, (_, i) => ({ id: `q${i}`, text: `Q${i} ?` })),
      animals: ['a', 'b', 'c', 'd'].map((id, k) => ({
        id,
        name: id,
        spoken: id,
        emoji: '🐾',
        facts: Array.from({ length: 30 }, (_, i) => ((i + k) % 2 ? 'y' : 'n')) as Fact[],
      })),
    };
    let s = newGame(many);
    while (s.phase === 'question') s = answerQuestion(many, s, 'dontKnow');
    expect(s.questionsAnswered).toBe(20);
    s = answerProposal(many, s, false);
    expect(s.phase).toBe('proposal');
    expect(s.questionsAnswered).toBe(20);
  });

  it('gives up after the 3rd wrong proposal', () => {
    let s = toProposal();
    for (let i = 0; i < 3; i++) {
      while (s.phase === 'question') s = answerQuestion(data, s, 'dontKnow');
      expect(s.phase).toBe('proposal');
      s = answerProposal(data, s, false);
    }
    expect(s.wrongGuesses).toBe(3);
    expect(s.phase).toBe('gaveUp');
  });

  it('gives up when every animal is discarded', () => {
    const two: GameData = { questions: data.questions, animals: data.animals.slice(0, 2) };
    let s = toProposal(two);
    s = answerProposal(two, s, false);
    while (s.phase === 'question') s = answerQuestion(two, s, 'dontKnow');
    s = answerProposal(two, s, false);
    expect(s.phase).toBe('gaveUp');
  });
});

describe('undo (AC-10)', () => {
  it('restores the exact state before the last answer', () => {
    const s0 = newGame(data);
    const s1 = answerQuestion(data, s0, 'yes');
    const s2 = answerQuestion(data, s1, 'no');
    expect(undo(s2)).toEqual(s1);
    expect(undo(undo(s2))).toEqual(s0);
  });

  it('is a no-op at the start', () => {
    const s0 = newGame(data);
    expect(undo(s0)).toBe(s0);
  });

  it('never crosses a proposal', () => {
    let s = newGame(data);
    while (s.phase === 'question') s = answerQuestion(data, s, 'dontKnow');
    s = answerProposal(data, s, false);
    expect(s.history).toHaveLength(0);
    expect(undo(s)).toBe(s);
  });

  it('is not available on a proposal', () => {
    let s = newGame(data);
    while (s.phase === 'question') s = answerQuestion(data, s, 'dontKnow');
    expect(undo(s)).toBe(s);
  });
});
