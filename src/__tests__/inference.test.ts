import {
  MAX_QUESTIONS,
  VARIETY_CANDIDATES,
  VARIETY_RATIO,
  answerProposal,
  answerQuestion,
  entropy,
  expectedGain,
  newGame,
  normalise,
  undo,
} from '../game/inference';
import { GAME_DATA } from '../game/data.generated';
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

  it('multiplies by 0.90 / 0.10 / 0.5 then renormalises on Oui', () => {
    let s = newGame(data);
    const q = 3; // farm: y n v n y
    s = { ...s, current: q };
    s = answerQuestion(data, s, 'yes');
    const raw = [0.9, 0.1, 0.5, 0.1, 0.9].map((x) => x * 0.2);
    const sum = raw.reduce((a, b) => a + b, 0);
    raw.forEach((r, i) => close(s.weights[i], r / sum));
  });

  it('uses the complement on Non', () => {
    let s = { ...newGame(data), current: 3 };
    s = answerQuestion(data, s, 'no');
    const raw = [0.1, 0.9, 0.5, 0.9, 0.1];
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

  it('after a wrong proposal at the cap, asks at least 3 more questions and extends the cap by 5', () => {
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
    expect(s.phase).toBe('question');
    for (let i = 0; i < 3; i++) {
      expect(s.phase).toBe('question');
      s = answerQuestion(many, s, 'dontKnow');
    }
    while (s.phase === 'question') s = answerQuestion(many, s, 'dontKnow');
    expect(s.phase).toBe('proposal');
    expect(s.questionsAnswered).toBe(25);
  });

  it('never proposes twice in a row while an informative question remains, even when confident', () => {
    // Real data, player thinking of the cat but refusing every proposal: count questions between proposals.
    let s = newGame(GAME_DATA);
    const cat = GAME_DATA.animals.findIndex((a) => a.id === 'cat');
    let sinceProposal = 0;
    for (let guard = 0; guard < 80 && (s.phase === 'question' || s.phase === 'proposal'); guard++) {
      if (s.phase === 'question') {
        const f = GAME_DATA.animals[cat].facts[s.current];
        s = answerQuestion(GAME_DATA, s, f === 'y' ? 'yes' : f === 'n' ? 'no' : 'dontKnow');
        sinceProposal++;
      } else {
        if (s.wrongGuesses > 0) expect(sinceProposal).toBeGreaterThanOrEqual(3);
        sinceProposal = 0;
        s = answerProposal(GAME_DATA, s, false);
      }
    }
    expect(s.phase).toBe('gaveUp');
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

describe('variety mode (AC-31, AC-10, v0.2.0)', () => {
  const many: GameData = {
    questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i}`, text: `Q${i} ?` })),
    // 8 animals, each question splits them 4/4 differently: all gains equal at the start.
    animals: Array.from({ length: 8 }, (_, k) => ({
      id: `a${k}`,
      name: `A${k}`,
      spoken: `le a${k}`,
      emoji: '🐾',
      facts: Array.from({ length: 6 }, (_, q) => ((k >> q % 3) & 1 ? 'y' : 'n')) as Fact[],
    })),
  };

  it('draws among at most VARIETY_CANDIDATES questions within VARIETY_RATIO of the best gain', () => {
    const det = newGame(many);
    const gains = many.questions.map((_, q) => expectedGain(many, det.weights, q));
    const best = Math.max(...gains);
    const ranked = gains
      .map((g, q) => ({ g, q }))
      .filter((x) => x.g >= VARIETY_RATIO * best)
      .sort((a, b) => (Math.abs(b.g - a.g) > 1e-12 ? b.g - a.g : a.q - b.q))
      .slice(0, VARIETY_CANDIDATES)
      .map((x) => x.q);
    const seen = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const s = newGame(many, seed);
      expect(ranked).toContain(s.current);
      seen.add(s.current);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('is reproducible: the same seed gives the same game', () => {
    const play = (seed: number) => {
      let s = newGame(data, seed);
      const qs: number[] = [];
      while (s.phase === 'question') {
        qs.push(s.current);
        s = answerQuestion(data, s, 'yes');
      }
      return qs;
    };
    expect(play(42)).toEqual(play(42));
  });

  it('deterministic mode (no seed) always takes the best question', () => {
    expect(newGame(many).current).toBe(0);
    expect(newGame(many).rng).toBeNull();
  });

  it('undo restores the generator, so the next draw is unchanged', () => {
    let s = newGame(many, 7);
    s = answerQuestion(many, s, 'yes');
    const after = answerQuestion(many, s, 'no');
    const back = answerQuestion(many, undo(after), 'no');
    expect(back.current).toBe(after.current);
    expect(back.rng).toBe(after.rng);
  });
});

describe('variety mode keeps the rules (AC-07)', () => {
  it('never asks again a question answered Je ne sais pas, whatever the seed', () => {
    for (let seed = 1; seed <= 30; seed++) {
      let s = newGame(GAME_DATA, seed);
      const dontKnow = new Set<number>();
      let guard = 0;
      while (s.phase === 'question' && guard++ < 25) {
        expect(dontKnow.has(s.current)).toBe(false);
        dontKnow.add(s.current);
        s = answerQuestion(GAME_DATA, s, 'dontKnow');
      }
    }
  });
});

describe('variety rule on the real data (AC-31, v0.2.0)', () => {
  it('opening questions are always among the 6 best with gain >= 50 % of the best, and the cap is exercised', () => {
    const det = newGame(GAME_DATA);
    const ranked = GAME_DATA.questions
      .map((_, q) => ({ q, g: expectedGain(GAME_DATA, det.weights, q) }))
      .sort((a, b) => (Math.abs(b.g - a.g) > 1e-12 ? b.g - a.g : a.q - b.q));
    const best = ranked[0].g;
    const aboveRatio = ranked.filter((x) => x.g >= VARIETY_RATIO * best);
    const eligible = new Set(aboveRatio.slice(0, VARIETY_CANDIDATES).map((x) => x.q));
    // Both limits are exercised: more questions pass the 50 % threshold than the cap keeps, and some fail it.
    expect(aboveRatio.length).toBeGreaterThan(VARIETY_CANDIDATES);
    expect(ranked.length).toBeGreaterThan(aboveRatio.length);
    const drawn = new Set<number>();
    for (let seed = 1; seed <= 300; seed++) {
      const q = newGame(GAME_DATA, seed).current;
      expect(eligible.has(q)).toBe(true);
      drawn.add(q);
    }
    expect(drawn.size).toBe(VARIETY_CANDIDATES); // every eligible question is drawn at some point
  });
});
