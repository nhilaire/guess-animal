// The engine is deterministic, so the e2e paths are known in advance. The flows that depend on the data are generated
// here and checked for drift: `UPDATE_FLOWS=1 npx jest e2e-flows` rewrites them after a data change.
import fs from 'node:fs';
import path from 'node:path';

import { GAME_DATA } from '../game/data.generated';
import { MAX_WRONG_GUESSES, answerProposal, answerQuestion, newGame } from '../game/inference';
import { fr } from '../i18n/fr';

const FLOWS = path.resolve(__dirname, '..', '..', '.maestro');
const APP_ID = 'io.github.nhilaire.guessanimal';
const header = (name: string, tags: string[]) => [`appId: ${APP_ID}`, `name: ${JSON.stringify(name)}`, 'tags:', ...tags.map((t) => `  - ${t}`), '---'];
// Every flow opens the deterministic-mode deep link right after launch (PRD: e2e flows run in deterministic mode).
// The link is opened once the first screen is shown, so that the app's link listener is registered.
const launch = [
  '- launchApp:',
  '    clearState: true',
  '- extendedWaitUntil:',
  '    visible:',
  '      id: "consent-screen"',
  '    timeout: 15000',
  '- openLink: "guessanimal://deterministic"',
];
const start = [...launch, '- tapOn:', '    id: "consent-refuse"', '- tapOn:', '    id: "home-play"'];

function lionSteps(): string[] {
  const data = GAME_DATA;
  const target = data.animals.findIndex((a) => a.id === 'lion');
  const steps: string[] = [];
  let s = newGame(data);
  while (s.phase === 'question') {
    const q = data.questions[s.current];
    const f = data.animals[target].facts[s.current];
    const answer = f === 'y' ? 'yes' : f === 'n' ? 'no' : 'dontKnow';
    steps.push('- assertVisible:', `    id: "q-${q.id}"`, '- tapOn:', `    id: "answer-${answer.toLowerCase()}"`);
    s = answerQuestion(data, s, answer);
  }
  expect(s.phase).toBe('proposal');
  expect(data.animals[s.current].id).toBe('lion');
  return steps;
}

function findLion(tag: string, name: string, consent: 'accept' | 'refuse'): string {
  const lion = GAME_DATA.animals.find((a) => a.id === 'lion')!;
  return [
    ...header(name, [tag]),
    ...launch,
    '- tapOn:',
    `    id: "consent-${consent}"`,
    '- tapOn:',
    '    id: "home-play"',
    ...lionSteps(),
    '- assertVisible:',
    '    id: "proposal-screen"',
    `- assertVisible: "${fr.proposal.question(lion.spoken)}"`,
    `- takeScreenshot: ${tag === 'telemetry' ? 'telemetry-' : ''}10-proposal-lion`,
    '- tapOn:',
    '    id: "proposal-yes"',
    '- assertVisible:',
    '    id: "victory-screen"',
    `- assertVisible: "${fr.victory.title}"`,
    `- takeScreenshot: ${tag === 'telemetry' ? 'telemetry-' : ''}11-victory`,
    '',
  ].join('\n');
}

function giveUp(): string {
  // Simulate the deterministic engine: always « Je ne sais pas », always « Non » to proposals, until it gives up.
  const steps: string[] = [];
  let st = newGame(GAME_DATA);
  while (st.phase === 'question' || st.phase === 'proposal') {
    if (st.phase === 'question') {
      steps.push('- tapOn:', '    id: "answer-dontknow"');
      st = answerQuestion(GAME_DATA, st, 'dontKnow');
    } else {
      steps.push('- assertVisible:', '    id: "proposal-screen"', '- tapOn:', '    id: "proposal-no"');
      st = answerProposal(GAME_DATA, st, false);
    }
  }
  expect(st.phase).toBe('gaveUp');
  expect(st.wrongGuesses).toBe(MAX_WRONG_GUESSES);
  return [
    ...header('Give up after 3 wrong proposals, pick an animal (AC-16)', ['e2e']),
    ...start,
    ...steps,
    '- assertVisible:',
    '    id: "giveup-screen"',
    `- assertVisible: "${fr.giveUp.title}"`,
    '- takeScreenshot: 20-give-up',
    '- scrollUntilVisible:',
    '    element:',
    '      id: "pick-not-listed"',
    '    direction: DOWN',
    '    timeout: 120000',
    '    speed: 90',
    `- assertVisible: "${fr.giveUp.notListed}"`,
    '- tapOn:',
    '    id: "pick-not-listed"',
    '- assertVisible:',
    '    id: "thanks-screen"',
    '- takeScreenshot: 21-thanks',
    '',
  ].join('\n');
}

// AC-33: in deterministic mode two games answered the same way show the same questions.
function sameSequence(): string {
  let s = newGame(GAME_DATA);
  const first = GAME_DATA.questions[s.current].id;
  s = answerQuestion(GAME_DATA, s, 'yes');
  const second = GAME_DATA.questions[s.current].id;
  const round = ['- assertVisible:', `    id: "q-${first}"`, '- tapOn:', '    id: "answer-yes"', '- assertVisible:', `    id: "q-${second}"`];
  return [
    ...header('Deterministic mode - two games answered the same way show the same questions (AC-33)', ['e2e']),
    ...start,
    ...round,
    '- back',
    '- assertVisible:',
    '    id: "home-screen"',
    '- tapOn:',
    '    id: "home-play"',
    ...round,
    '- takeScreenshot: 50-same-sequence',
    '',
  ].join('\n');
}

const generated: Record<string, () => string> = {
  'same-sequence.yaml': sameSequence,
  'find-lion.yaml': () => findLion('e2e', 'Find the lion - consistent answers, proposal, victory (AC-15)', 'refuse'),
  'telemetry-consent.yaml': () => findLion('telemetry', 'Telemetry - accept consent, play a full game (events checked in logcat by verify.mjs)', 'accept'),
  'give-up.yaml': giveUp,
};

describe('generated Maestro flows', () => {
  for (const [file, build] of Object.entries(generated)) {
    it(`${file} is in sync with the data`, () => {
      const text = build();
      const target = path.join(FLOWS, file);
      if (process.env.UPDATE_FLOWS) fs.writeFileSync(target, text, 'utf8');
      expect(fs.readFileSync(target, 'utf8')).toBe(text);
    });
  }
});
