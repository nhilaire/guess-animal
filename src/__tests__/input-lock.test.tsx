import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { Feedback, setFeedback } from '../audio/feedback';
import { INPUT_LOCK_MS } from '../ui/inputLock';

// T-34: buttons of consecutive game screens sit at the same spot, so the second tap of a double tap must not land on
// the next screen (false victory, skipped question...). Fake timers drive the clock of the lock.
const silent: Feedback = { question: () => {}, proposal: () => {}, line: () => {}, then: () => {}, effect: () => {}, vibrate: () => {}, stop: () => {} };

const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

async function startGame() {
  await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
  await render(<App />);
  await fireEvent.press(await screen.findByTestId('home-play'));
  await screen.findByTestId('question-screen');
}

async function dontKnowUntilProposal() {
  for (let guard = 0; guard < 40 && screen.queryByTestId('question-screen'); guard++) {
    await wait(INPUT_LOCK_MS);
    await fireEvent.press(screen.getByTestId('answer-dontknow'));
  }
  await wait(INPUT_LOCK_MS);
}

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
  setFeedback(silent);
});

afterEach(() => {
  jest.useRealTimers();
  setFeedback(null);
});

describe('double taps never reach the next screen (AC-15, AC-16)', () => {
  it('ignores a press 100 ms after an answer, accepts one after the lock', async () => {
    await startGame();
    await wait(INPUT_LOCK_MS);
    await fireEvent.press(screen.getByTestId('answer-dontknow'));
    await wait(100);
    await fireEvent.press(screen.getByTestId('answer-dontknow'));
    expect(screen.getByText('Question 2')).toBeTruthy();
    await wait(INPUT_LOCK_MS);
    await fireEvent.press(screen.getByTestId('answer-yes'));
    expect(screen.getByText('Question 3')).toBeTruthy();
  });

  it('ignores a press right after « Jouer »', async () => {
    await startGame();
    await fireEvent.press(screen.getByTestId('answer-yes'));
    expect(screen.getByText('Question 1')).toBeTruthy();
  });

  it('a double tap on the last answer does not answer « Oui » to the proposal', async () => {
    await startGame();
    for (let guard = 0; guard < 40 && screen.queryByTestId('question-screen'); guard++) {
      await wait(INPUT_LOCK_MS);
      await fireEvent.press(screen.getByTestId('answer-dontknow'));
      await wait(100);
      // Second tap of the double tap: same spot as « Oui » on the Proposal screen.
      if (screen.queryByTestId('proposal-screen')) await fireEvent.press(screen.getByTestId('proposal-yes'));
    }
    expect(screen.getByTestId('proposal-screen')).toBeTruthy();
  });

  it('a double tap on « Oui » of the proposal does not press « Rejouer »', async () => {
    await startGame();
    await dontKnowUntilProposal();
    await fireEvent.press(screen.getByTestId('proposal-yes'));
    await wait(100);
    await fireEvent.press(screen.getByTestId('end-play-again'));
    expect(screen.getByTestId('victory-screen')).toBeTruthy();
    await wait(INPUT_LOCK_MS);
    await fireEvent.press(screen.getByTestId('end-play-again'));
    expect(screen.getByText('Question 1')).toBeTruthy();
  });

  it('a double tap on « Non » of the 3rd proposal does not pick an animal of the Give up list', async () => {
    await startGame();
    for (let i = 0; i < 3; i++) {
      await dontKnowUntilProposal();
      await fireEvent.press(screen.getByTestId('proposal-no'));
    }
    expect(screen.getByTestId('giveup-screen')).toBeTruthy();
    await wait(100);
    await fireEvent.press(screen.getByTestId('pick-not-listed'));
    expect(screen.getByTestId('giveup-screen')).toBeTruthy();
    await wait(INPUT_LOCK_MS);
    await fireEvent.press(screen.getByTestId('pick-not-listed'));
    expect(screen.getByTestId('thanks-screen')).toBeTruthy();
    await wait(100);
    await fireEvent.press(screen.getByTestId('end-play-again'));
    expect(screen.getByTestId('thanks-screen')).toBeTruthy();
  });
});
