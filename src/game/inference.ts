// Guessing engine (PRD "Rules and scoring > Inference"). Pure functions, no React. The only randomness is the
// seeded generator kept in the game state (variety mode); without a seed the engine is fully deterministic.
import { Fact, GameData } from './types';

export const P_YES: Record<Fact, number> = { y: 0.9, n: 0.1, v: 0.5 };
export const PROPOSE_THRESHOLD = 0.85;
export const MAX_QUESTIONS = 20;
export const MIN_GAIN_BITS = 0.01;
export const MAX_WRONG_GUESSES = 3;
export const MIN_QUESTIONS_AFTER_MISS = 3;
export const EXTRA_QUESTIONS_PER_MISS = 5;
export const VARIETY_RATIO = 0.5;
export const VARIETY_CANDIDATES = 6;

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
  rng: number | null; // mulberry32 state (variety mode) or null (deterministic mode)
  lastMissAt: number | null; // questionsAnswered at the last wrong proposal
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

const xlog2 = (x: number) => (x > 0 ? x * Math.log2(x) : 0);
const LOG_YES: Record<Fact, number> = { y: Math.log2(P_YES.y), n: Math.log2(P_YES.n), v: Math.log2(P_YES.v) };
const LOG_NO: Record<Fact, number> = { y: Math.log2(1 - P_YES.y), n: Math.log2(1 - P_YES.n), v: Math.log2(1 - P_YES.v) };

// For unnormalised x with sum S: H(x/S) = log2(S) - (sum x log2 x) / S. With y = w*l:
// y log2 y = l * (w log2 w) + y log2 l, so the inner loop needs no logarithm (wlw = w log2 w, precomputed).
function gain(data: GameData, weights: number[], wlw: number[], total: number, before: number, q: number): number {
  let pYes = 0;
  let pNo = 0;
  let xlxYes = 0;
  let xlxNo = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    if (w <= 0) continue;
    const f = data.animals[i].facts[q];
    const l = P_YES[f];
    const y = w * l;
    const n = w - y;
    pYes += y;
    pNo += n;
    xlxYes += l * wlw[i] + y * LOG_YES[f];
    xlxNo += (1 - l) * wlw[i] + n * LOG_NO[f];
  }
  const after = (xlog2(pYes) - xlxYes + xlog2(pNo) - xlxNo) / total;
  return before - after;
}

function prepare(weights: number[]) {
  const wlw = weights.map(xlog2);
  const total = weights.reduce((a, b) => a + b, 0);
  const before = total > 0 ? Math.log2(total) - wlw.reduce((a, b) => a + b, 0) / total : 0;
  return { wlw, total, before };
}

// Expected information gain (bits) of asking question q, for a Oui / Non answer.
export function expectedGain(data: GameData, weights: number[], q: number): number {
  const { wlw, total, before } = prepare(weights);
  return total > 0 ? gain(data, weights, wlw, total, before, q) : 0;
}

function topAnimal(c: Core): number {
  let best = -1;
  c.weights.forEach((w, i) => {
    if (!c.discarded[i] && (best < 0 || w > c.weights[best])) best = i;
  });
  return best;
}

// Mulberry32: one step returns a number in [0, 1) and the next state.
export function nextRandom(state: number): [number, number] {
  const a = (state + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, a];
}

// Unasked questions ranked by gain (ties: earlier in the data), best first.
function rankedQuestions(data: GameData, c: Core): { q: number; gain: number }[] {
  const { wlw, total, before } = prepare(c.weights);
  if (total <= 0) return [];
  const out: { q: number; gain: number }[] = [];
  for (let i = 0; i < data.questions.length; i++) {
    if (!c.asked[i]) out.push({ q: i, gain: gain(data, c.weights, wlw, total, before, i) });
  }
  return out.sort((a, b) => (Math.abs(b.gain - a.gain) > 1e-12 ? b.gain - a.gain : a.q - b.q));
}

// Deterministic mode: the best question. Variety mode: drawn among at most 6 questions within 50 % of the best.
function chooseQuestion(data: GameData, c: Core): { q: number; gain: number; rng: number | null } {
  const ranked = rankedQuestions(data, c);
  if (ranked.length === 0) return { q: -1, gain: 0, rng: c.rng };
  const best = ranked[0];
  if (c.rng === null) return { ...best, rng: null };
  const candidates = ranked.filter((x) => x.gain >= VARIETY_RATIO * best.gain).slice(0, VARIETY_CANDIDATES);
  if (candidates.length < 2) return { ...best, rng: c.rng };
  const [r, rng] = nextRandom(c.rng);
  return { ...candidates[Math.floor(r * candidates.length)], rng };
}

// Decides the next step: a proposal or the next question (or giving up).
function advance(data: GameData, c: Core): Core {
  const top = topAnimal(c);
  if (top < 0) return { ...c, phase: 'gaveUp', current: -1 };
  // After a wrong proposal: a few more questions before proposing again, and a larger question budget.
  const cap = MAX_QUESTIONS + EXTRA_QUESTIONS_PER_MISS * c.wrongGuesses;
  const mayPropose = c.lastMissAt === null || c.questionsAnswered - c.lastMissAt >= MIN_QUESTIONS_AFTER_MISS;
  if ((c.weights[top] >= PROPOSE_THRESHOLD && mayPropose) || c.questionsAnswered >= cap) {
    return { ...c, phase: 'proposal', current: top };
  }
  const { q, gain, rng } = chooseQuestion(data, c);
  if (q < 0 || gain <= MIN_GAIN_BITS) return { ...c, phase: 'proposal', current: top };
  return { ...c, phase: 'question', current: q, rng };
}

function core(s: GameState): Core {
  const { history: _history, ...c } = s;
  return c;
}

// Without a seed: deterministic mode (tests, e2e). With a seed: variety mode (players).
export function newGame(data: GameData, seed?: number): GameState {
  const n = data.animals.length;
  const start: Core = {
    phase: 'question',
    current: -1,
    weights: Array(n).fill(1 / n),
    asked: Array(data.questions.length).fill(false),
    discarded: Array(n).fill(false),
    questionsAnswered: 0,
    wrongGuesses: 0,
    rng: seed === undefined ? null : seed >>> 0,
    lastMissAt: null,
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
  const c: Core = { ...core(s), weights, discarded, wrongGuesses, lastMissAt: s.questionsAnswered };
  if (wrongGuesses >= MAX_WRONG_GUESSES) return { ...c, phase: 'gaveUp', history: [] };
  return { ...advance(data, c), history: [] };
}

// Back to the state before the last answer to a question; never crosses a proposal.
export function undo(s: GameState): GameState {
  if (s.phase !== 'question' || s.history.length === 0) return s;
  const prev = s.history[s.history.length - 1];
  return { ...prev, history: s.history.slice(0, -1) };
}
