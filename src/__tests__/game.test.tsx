import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';

import App from '../App';
import { Feedback, setFeedback } from '../audio/feedback';
import { GAME_DATA, GAME_DATA_EN } from '../game/data.generated';
import { deviceLanguageTags } from '../i18n/deviceLocale';

const recorded: string[] = [];
// Language of every voice clip asked for, in order.
const voiceLanguages: string[] = [];
const fake: Feedback = {
  question: (id, language) => voiceLanguages.push(language) && recorded.push(`question:${id}`),
  proposal: (id, language) => voiceLanguages.push(language) && recorded.push(`proposal:${id}`),
  line: (l, language) => voiceLanguages.push(language) && recorded.push(`line:${l}`),
  then: (l, language) => voiceLanguages.push(language) && recorded.push(`then:${l}`),
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
  voiceLanguages.length = 0;
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

describe('background and resume keep the draws (AC-25, v0.2.0)', () => {
  it('a paused game shows the same next questions as an uninterrupted one with the same seed', async () => {
    const random = jest.spyOn(Math, 'random').mockReturnValue(0.4242);
    const listeners: ((s: AppStateStatus) => void)[] = [];
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, fn) => {
      listeners.push(fn as (s: AppStateStatus) => void);
      return { remove: () => {} } as ReturnType<typeof AppState.addEventListener>;
    });
    const sequence = async (pause: boolean) => {
      await startGame();
      const ids = [currentQuestionId()];
      for (let i = 0; i < 3; i++) {
        if (pause && i === 1) {
          await act(async () => listeners.forEach((l) => l('background')));
          await act(async () => listeners.forEach((l) => l('active')));
        }
        await fireEvent.press(screen.getByTestId('answer-yes'));
        ids.push(currentQuestionId());
      }
      screen.unmount();
      await AsyncStorage.clear();
      return ids;
    };
    const plain = await sequence(false);
    const paused = await sequence(true);
    expect(paused).toEqual(plain);
    spy.mockRestore();
    random.mockRestore();
  });
});

describe('game in English (AC-38)', () => {
  beforeEach(async () => {
    jest.mocked(deviceLanguageTags).mockReturnValue(['fr-FR']);
  });

  async function startEnglishGame() {
    await AsyncStorage.setItem('settings.language.v1', 'en');
    await startGame();
  }

  it('shows the English question, answers and proposal, and finds the lion', async () => {
    await startEnglishGame();
    const id = currentQuestionId();
    expect(screen.getByText(GAME_DATA_EN.questions[questionIndex(id)].text)).toBeTruthy();
    for (const label of ['Yes', 'No', "I don't know", 'Listen again', 'Go back']) expect(screen.getAllByText(label, { exact: false }).length).toBeGreaterThan(0);
    await answerFor('lion');
    expect(screen.getByText("I've got it! Is it a lion?")).toBeTruthy();
    await fireEvent.press(screen.getByTestId('proposal-yes'));
    expect(screen.getByText("Yippee, I'm so good!")).toBeTruthy();
    expect(screen.getByText('It was a lion.')).toBeTruthy();
    // Every clip (pitch, questions, proposal, victory) was asked for in English.
    expect(recorded).toEqual(expect.arrayContaining(['line:pitch', 'proposal:lion', 'line:victory']));
    expect(new Set(voiceLanguages)).toEqual(new Set(['en']));
  });

  it('sorts the Give up list by English name', async () => {
    await startEnglishGame();
    for (let i = 0; i < 3; i++) {
      await answerDontKnowUntilProposal();
      await fireEvent.press(screen.getByTestId('proposal-no'));
    }
    expect(screen.getByText("Well done, you're really good!")).toBeTruthy();
    const firstNames = screen.getAllByTestId(/^pick-(?!not-listed)/).slice(0, 3).map((n) => String(n.props.testID));
    expect(firstNames).toEqual(['pick-anaconda', 'pick-ant', 'pick-anteater']);
  });

  it('switching the language during a game keeps the same question and counter', async () => {
    const listeners: ((s: AppStateStatus) => void)[] = [];
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, fn) => {
      listeners.push(fn as (s: AppStateStatus) => void);
      return { remove: () => {} } as ReturnType<typeof AppState.addEventListener>;
    });
    await startGame();
    await fireEvent.press(screen.getByTestId('answer-yes'));
    const id = currentQuestionId();
    expect(screen.getByText('Question 2')).toBeTruthy();
    expect(screen.getByText(GAME_DATA.questions[questionIndex(id)].text)).toBeTruthy();
    // The player switches the phone to English and comes back to the game.
    jest.mocked(deviceLanguageTags).mockReturnValue(['en-US']);
    await act(async () => listeners.forEach((l) => l('active')));
    expect(currentQuestionId()).toBe(id);
    expect(screen.getByText('Question 2')).toBeTruthy();
    expect(screen.getByText(GAME_DATA_EN.questions[questionIndex(id)].text)).toBeTruthy();
    expect(screen.getByText('Yes', { exact: false })).toBeTruthy();
    spy.mockRestore();
  });
});
