// Simulated players on the real data (PRD "Quality targets"). Used by tests only.
import { Answer, GameState, answerProposal, answerQuestion, newGame } from './inference';
import { Fact, GameData } from './types';

export type Outcome = { found: boolean; proposals: number; questions: number; firstProposalAt: number };

const perfectAnswer = (f: Fact): Answer => (f === 'y' ? 'yes' : f === 'n' ? 'no' : 'dontKnow');

// Plays a full game for `target`. `invertAt` = index (0-based) among the player's Oui/Non answers to invert.
export function play(data: GameData, target: number, invertAt = -1, seed?: number): Outcome {
  let s: GameState = newGame(data, seed);
  let yesNo = 0;
  let proposals = 0;
  let firstProposalAt = -1;
  for (let guard = 0; guard < 200; guard++) {
    if (s.phase === 'question') {
      let a = perfectAnswer(data.animals[target].facts[s.current]);
      if (a !== 'dontKnow') {
        if (yesNo === invertAt) a = a === 'yes' ? 'no' : 'yes';
        yesNo++;
      }
      s = answerQuestion(data, s, a);
    } else if (s.phase === 'proposal') {
      proposals++;
      if (firstProposalAt < 0) firstProposalAt = s.questionsAnswered;
      s = answerProposal(data, s, s.current === target);
    } else break;
  }
  return { found: s.phase === 'found', proposals, questions: s.questionsAnswered, firstProposalAt };
}

// Number of Oui/Non answers on the perfect player's path to the first proposal.
export function yesNoAnswersOnPerfectPath(data: GameData, target: number, seed?: number): number {
  let s = newGame(data, seed);
  let n = 0;
  while (s.phase === 'question') {
    const a = perfectAnswer(data.animals[target].facts[s.current]);
    if (a !== 'dontKnow') n++;
    s = answerQuestion(data, s, a);
  }
  return n;
}
