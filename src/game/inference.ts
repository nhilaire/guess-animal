// Deterministic guessing engine (PRD "Rules and scoring > Inference"). Pure functions, no React, no randomness.
import { Fact, GameData } from './types';

export const P_YES: Record<Fact, number> = { y: 0.95, n: 0.05, v: 0.5 };
export const PROPOSE_THRESHOLD = 0.85;
export const MAX_QUESTIONS = 20;
export const MIN_GAIN_BITS = 0.01;
export const MAX_WRONG_GUESSES = 3;

export type Answer = 'yes' | 'no' | 'dontKnow';
export type Phase = 'question' | 'proposal' | 'found' | 'gaveUp';

type Core = {
  phase: Phase;
  current: number; // question index (phase "question") or animal index (other phases)
  weights: number[];
  asked: boolean[];
  discarded: boolean[];
  questionsAnswered: number;
  wrongGuesses: number;
};

// `history` holds the states before each answer since the last proposal, for undo.
export type GameState = Core & { history: Core[] };

export function normalise(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  return sum > 0 ? weights.map((w) => w / sum) : weights.map(() => 0);
}

export function entropy(p: number[]): number {
  let h = 0;
  for (const x of p) if (x > 0) h -= x * Math.log2(x);
  return h;
}

// Expected information gain (bits) of asking question q, for a Oui / Non answer.
export function expectedGain(data: GameData, weights: number[], q: number): number {
  let pYes = 0;
  const yes: number[] = [];
  const no: number[] = [];
  data.animals.forEach((a, i) => {
    const l = P_YES[a.facts[q]];
    yes.push(weights[i] * l);
    no.push(weights[i] * (1 - l));
    pYes += weights[i] * l;
  });
  const pNo = 1 - pYes;
  const after = (pYes > 0 ? pYes * entropy(normalise(yes)) : 0) + (pNo > 0 ? pNo * entropy(normalise(no)) : 0);
  return entropy(weights) - after;
}

function topAnimal(c: Core): number {
  let best = -1;
  c.weights.forEach((w, i) => {
    if (!c.discarded[i] && (best < 0 || w > c.weights[best])) best = i;
  });
  return best;
}

function bestQuestion(data: GameData, c: Core): { q: number; gain: number } {
  let q = -1;
  let gain = -Infinity;
  for (let i = 0; i < data.questions.length; i++) {
    if (c.asked[i]) continue;
    const g = expectedGain(data, c.weights, i);
    if (g > gain + 1e-12) {
      q = i;
      gain = g;
    }
  }
  return { q, gain };
}

// Decides the next step: a proposal or the next question (or giving up).
function advance(data: GameData, c: Core): Core {
  const top = topAnimal(c);
  if (top < 0) return { ...c, phase: 'gaveUp', current: -1 };
  if (c.weights[top] >= PROPOSE_THRESHOLD || c.questionsAnswered >= MAX_QUESTIONS) {
    return { ...c, phase: 'proposal', current: top };
  }
  const { q, gain } = bestQuestion(data, c);
  if (q < 0 || gain <= MIN_GAIN_BITS) return { ...c, phase: 'proposal', current: top };
  return { ...c, phase: 'question', current: q };
}

function core(s: GameState): Core {
  const { history: _history, ...c } = s;
  return c;
}

export function newGame(data: GameData): GameState {
  const n = data.animals.length;
  const start: Core = {
    phase: 'question',
    current: -1,
    weights: Array(n).fill(1 / n),
    asked: Array(data.questions.length).fill(false),
    discarded: Array(n).fill(false),
    questionsAnswered: 0,
    wrongGuesses: 0,
  };
  return { ...advance(data, start), history: [] };
}

export function answerQuestion(data: GameData, s: GameState, answer: Answer): GameState {
  if (s.phase !== 'question') return s;
  const q = s.current;
  let weights = s.weights;
  if (answer !== 'dontKnow') {
    weights = normalise(
      data.animals.map((a, i) => {
        const l = P_YES[a.facts[q]];
        return s.weights[i] * (answer === 'yes' ? l : 1 - l);
      }),
    );
  }
  const asked = s.asked.slice();
  asked[q] = true;
  const next = advance(data, { ...core(s), weights, asked, questionsAnswered: s.questionsAnswered + 1 });
  return { ...next, history: [...s.history, core(s)] };
}

export function answerProposal(data: GameData, s: GameState, correct: boolean): GameState {
  if (s.phase !== 'proposal') return s;
  if (correct) return { ...core(s), phase: 'found', history: [] };
  const discarded = s.discarded.slice();
  discarded[s.current] = true;
  const weights = normalise(s.weights.map((w, i) => (discarded[i] ? 0 : w)));
  const wrongGuesses = s.wrongGuesses + 1;
  const c: Core = { ...core(s), weights, discarded, wrongGuesses };
  if (wrongGuesses >= MAX_WRONG_GUESSES) return { ...c, phase: 'gaveUp', history: [] };
  return { ...advance(data, c), history: [] };
}

// Back to the state before the last answer to a question; never crosses a proposal.
export function undo(s: GameState): GameState {
  if (s.phase !== 'question' || s.history.length === 0) return s;
  const prev = s.history[s.history.length - 1];
  return { ...prev, history: s.history.slice(0, -1) };
}
