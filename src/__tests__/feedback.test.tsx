import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import App from '../App';
import { createExpoFeedback } from '../audio/expoFeedback';
import { Feedback, setFeedback } from '../audio/feedback';
import { VOICE } from '../audio/manifest.generated';
import { GAME_DATA } from '../game/data.generated';

const calls: string[] = [];
const fake: Feedback = {
  question: (id) => calls.push(`question:${id}`),
  proposal: (id) => calls.push(`proposal:${id}`),
  line: (l) => calls.push(`line:${l}`),
  then: (l) => calls.push(`then:${l}`),
  effect: (e) => calls.push(`effect:${e}`),
  vibrate: () => calls.push('vibrate'),
  stop: () => calls.push('stop'),
};

const questionIndex = (id: string) => GAME_DATA.questions.findIndex((q) => q.id === id);
const currentQuestionId = () => String(screen.getByTestId(/^q-/).props.testID).replace(/^q-/, '');

async function launch(settings: { sound: boolean; vibrations: boolean }) {
  await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
  await AsyncStorage.setItem('settings.v1', JSON.stringify(settings));
  await render(<App />);
  await screen.findByTestId('home-screen');
  await fireEvent.press(screen.getByTestId('home-play'));
}

async function playToEnd(animalId: string) {
  const animal = GAME_DATA.animals.find((a) => a.id === animalId)!;
  for (let g = 0; g < 30 && screen.queryByTestId('question-screen'); g++) {
    const f = animal.facts[questionIndex(currentQuestionId())];
    await fireEvent.press(screen.getByTestId(f === 'y' ? 'answer-yes' : f === 'n' ? 'answer-no' : 'answer-dontknow'));
  }
  await fireEvent.press(screen.getByTestId('proposal-yes'));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  calls.length = 0;
  setFeedback(fake);
});

afterAll(() => setFeedback(null));

describe('voice (AC-19)', () => {
  it('sound on: speaks the question, replays it, stops on answer, speaks the proposal', async () => {
    await launch({ sound: true, vibrations: true });
    const first = currentQuestionId();
    expect(calls).toContain(`question:${first}`);
    calls.length = 0;
    await fireEvent.press(screen.getByTestId('game-replay'));
    expect(calls).toEqual([`question:${first}`]);
    calls.length = 0;
    await fireEvent.press(screen.getByTestId('answer-yes'));
    expect(calls[0]).toBe('stop');
    expect(calls[1]).toMatch(/^question:/);
    await playToEnd('lion');
    expect(calls).toContain('proposal:lion');
  });

  it('sound off: no voice at all', async () => {
    await launch({ sound: false, vibrations: true });
    await fireEvent.press(screen.getByTestId('game-replay'));
    await playToEnd('lion');
    expect(calls.filter((c) => !['stop', 'vibrate'].includes(c))).toEqual([]);
  });
});

describe('effects and vibrations (AC-26)', () => {
  it('victory: win effect, victory line and a vibration when both are on', async () => {
    await launch({ sound: true, vibrations: true });
    await playToEnd('cat');
    expect(calls).toEqual(expect.arrayContaining(['effect:win', 'line:victory', 'vibrate']));
  });

  it('give up: lose effect, both lines chained and a vibration', async () => {
    await launch({ sound: true, vibrations: true });
    for (let i = 0; i < 3; i++) {
      for (let g = 0; g < 30 && screen.queryByTestId('question-screen'); g++) await fireEvent.press(screen.getByTestId('answer-dontknow'));
      await fireEvent.press(screen.getByTestId('proposal-no'));
    }
    expect(calls).toEqual(expect.arrayContaining(['effect:lose', 'line:giveUp', 'then:giveUpBody', 'vibrate']));
  });

  it('nothing when sound and vibrations are off', async () => {
    await launch({ sound: false, vibrations: false });
    await playToEnd('cat');
    expect(calls.filter((c) => c !== 'stop')).toEqual([]);
  });
});

describe('expo-audio implementation', () => {
  beforeEach(() => jest.mocked(createAudioPlayer).mockClear());

  it('plays the bundled clip of a question and reuses the voice player', () => {
    const f = createExpoFeedback();
    f.question('mammal');
    expect(createAudioPlayer).toHaveBeenCalledWith(VOICE.questions.mammal.source);
    const player = jest.mocked(createAudioPlayer).mock.results[0].value;
    expect(player.play).toHaveBeenCalled();
    f.proposal('lion');
    expect(player.replace).toHaveBeenCalledWith(VOICE.proposals.lion.source);
    f.stop();
    expect(player.pause).toHaveBeenCalled();
  });

  it('plays effects on a separate player and vibrates with expo-haptics', () => {
    const f = createExpoFeedback();
    f.effect('win');
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    f.vibrate();
    expect(Haptics.notificationAsync).toHaveBeenCalled();
  });

  it('never throws when the native player fails', () => {
    jest.mocked(createAudioPlayer).mockImplementationOnce(() => {
      throw new Error('no audio');
    });
    expect(() => createExpoFeedback().question('mammal')).not.toThrow();
  });
});
