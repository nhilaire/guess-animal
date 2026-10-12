import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';

import App from '../App';
import { Feedback, setFeedback } from '../audio/feedback';
import { GAME_DATA } from '../game/data.generated';

const recorded: string[] = [];
const fake: Feedback = {
  question: (id) => recorded.push(`question:${id}`),
  proposal: (id) => recorded.push(`proposal:${id}`),
  line: (l) => recorded.push(`line:${l}`),
  then: (l) => recorded.push(`then:${l}`),
  effect: (e) => recorded.push(`effect:${e}`),
  vibrate: () => recorded.push('vibrate'),
  stop: () => recorded.push('stop'),
};

const questionIndex = (id: string) => GAME_DATA.questions.findIndex((q) => q.id === id);
const currentQuestionId = () => String(screen.getByTestId(/^q-/).props.testID).replace(/^q-/, '');

async function startGame() {
  await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
  await render(<App />);
  await fireEvent.press(await screen.findByTestId('home-play'));
  await screen.findByTestId('question-screen');
}

// Answers like a player thinking of `animalId` until the proposal screen.
async function answerFor(animalId: string) {
  const animal = GAME_DATA.animals.find((a) => a.id === animalId)!;
  for (let guard = 0; guard < 30 && screen.queryByTestId('question-screen'); guard++) {
    const f = animal.facts[questionIndex(currentQuestionId())];
    await fireEvent.press(screen.getByTestId(f === 'y' ? 'answer-yes' : f === 'n' ? 'answer-no' : 'answer-dontknow'));
  }
}

async function answerDontKnowUntilProposal() {
  for (let guard = 0; guard < 30 && screen.queryByTestId('question-screen'); guard++) {
    await fireEvent.press(screen.getByTestId('answer-dontknow'));
  }
}

beforeEach(async () => {
  await AsyncStorage.clear();
  recorded.length = 0;
  setFeedback(fake);
});

afterAll(() => setFeedback(null));

describe('game screens', () => {
  it('shows question 1 with the three answers, replay and undo (AC-14)', async () => {
    await startGame();
    expect(screen.getByText('Question 1')).toBeTruthy();
    for (const label of ['Oui', 'Non', 'Je ne sais pas', 'Réécouter', 'Revenir']) expect(screen.getByText(label, { exact: false })).toBeTruthy();
    expect(screen.getByTestId('game-undo').props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('finds the lion and shows the victory screen (AC-15)', async () => {
    await startGame();
    await answerFor('lion');
    expect(screen.getByTestId('proposal-text').props.children).toBe("J'ai trouvé ! C'est le lion ?");
    await fireEvent.press(screen.getByTestId('proposal-yes'));
    expect(screen.getByTestId('victory-screen')).toBeTruthy();
    expect(screen.getByText('Youpi, je suis trop fort !')).toBeTruthy();
    expect(screen.getByText("C'était le lion.")).toBeTruthy();
  });

  it('gives up after 3 wrong proposals and lets the player pick an animal (AC-16)', async () => {
    await startGame();
    for (let i = 0; i < 3; i++) {
      await answerDontKnowUntilProposal();
      await fireEvent.press(screen.getByTestId('proposal-no'));
    }
    expect(screen.getByTestId('giveup-screen')).toBeTruthy();
    expect(screen.getByText('Bravo, tu es très fort !')).toBeTruthy();
    expect(screen.getByTestId('pick-not-listed')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pick-not-listed'));
    expect(screen.getByTestId('thanks-screen')).toBeTruthy();
    expect(screen.getByText('Merci ! Je ferai mieux la prochaine fois.')).toBeTruthy();
  });

  it('undo goes back to the previous question (AC-17)', async () => {
    await startGame();
    const first = currentQuestionId();
    await fireEvent.press(screen.getByTestId('answer-yes'));
    expect(screen.getByText('Question 2')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('game-undo'));
    expect(screen.getByText('Question 1')).toBeTruthy();
    expect(currentQuestionId()).toBe(first);
  });

  it('keeps the game when the app goes to background and comes back (AC-25)', async () => {
    const listeners: ((s: AppStateStatus) => void)[] = [];
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, fn) => {
      listeners.push(fn as (s: AppStateStatus) => void);
      return { remove: () => {} } as ReturnType<typeof AppState.addEventListener>;
    });
    await startGame();
    await fireEvent.press(screen.getByTestId('answer-no'));
    const before = currentQuestionId();
    recorded.length = 0;
    await act(async () => listeners.forEach((l) => l('background')));
    await act(async () => listeners.forEach((l) => l('active')));
    expect(recorded).toContain('stop');
    expect(screen.getByText('Question 2')).toBeTruthy();
    expect(currentQuestionId()).toBe(before);
    spy.mockRestore();
  });

  it('play again restarts at question 1', async () => {
    await startGame();
    await answerFor('cat');
    await fireEvent.press(screen.getByTestId('proposal-yes'));
    await fireEvent.press(screen.getByTestId('end-play-again'));
    expect(screen.getByText('Question 1')).toBeTruthy();
  });
});
