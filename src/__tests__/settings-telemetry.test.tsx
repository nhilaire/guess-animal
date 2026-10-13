import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '@react-native-firebase/analytics';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import App from '../App';
import { GAME_DATA } from '../game/data.generated';

const questionIndex = (id: string) => GAME_DATA.questions.findIndex((q) => q.id === id);
const currentQuestionId = () => String(screen.getByTestId(/^q-/).props.testID).replace(/^q-/, '');
const logged = () => (logEvent as jest.Mock).mock.calls.map(([, name, params]) => [name, params]);

async function launch(consent: 'granted' | 'denied') {
  await AsyncStorage.setItem('telemetry.consent.v1', consent);
  await render(<App />);
  await screen.findByTestId('home-screen');
}

async function play(animalId: string) {
  const animal = GAME_DATA.animals.find((a) => a.id === animalId)!;
  await fireEvent.press(screen.getByTestId('home-play'));
  for (let guard = 0; guard < 30 && screen.queryByTestId('question-screen'); guard++) {
    const f = animal.facts[questionIndex(currentQuestionId())];
    await fireEvent.press(screen.getByTestId(f === 'y' ? 'answer-yes' : f === 'n' ? 'answer-no' : 'answer-dontknow'));
  }
}

beforeEach(async () => {
  await AsyncStorage.clear();
  (logEvent as jest.Mock).mockClear();
});

describe('settings (AC-18)', () => {
  it('saves sound, vibrations and statistics when toggled', async () => {
    await launch('granted');
    await fireEvent.press(screen.getByTestId('home-settings'));
    expect(screen.getByText('Son')).toBeTruthy();
    expect(screen.getByText('Vibrations')).toBeTruthy();
    expect(screen.getByText('Statistiques anonymes')).toBeTruthy();
    await fireEvent(screen.getByTestId('settings-sound'), 'valueChange', false);
    await fireEvent(screen.getByTestId('settings-vibrations'), 'valueChange', false);
    await fireEvent(screen.getByTestId('settings-telemetry'), 'valueChange', false);
    await act(async () => {}); // let the async saves settle
    expect(JSON.parse((await AsyncStorage.getItem('settings.v1')) ?? '{}')).toEqual({ sound: false, vibrations: false });
    expect(await AsyncStorage.getItem('telemetry.consent.v1')).toBe('denied');
  });

  it('restores the saved settings at launch', async () => {
    await AsyncStorage.setItem('settings.v1', JSON.stringify({ sound: false, vibrations: false }));
    await launch('denied');
    await fireEvent.press(screen.getByTestId('home-settings'));
    expect(screen.getByTestId('settings-sound').props.value).toBe(false);
    expect(screen.getByTestId('settings-vibrations').props.value).toBe(false);
    expect(screen.getByTestId('settings-telemetry').props.value).toBe(false);
  });
});

describe('telemetry calls (AC-20, AC-21)', () => {
  it('logs game_start and game_end found with the PRD params', async () => {
    await launch('granted');
    await play('lion');
    await fireEvent.press(screen.getByTestId('proposal-yes'));
    const events = logged();
    expect(events[0]).toEqual(['game_start', {}]);
    const end = events.find(([n]) => n === 'game_end');
    expect(end?.[1]).toEqual({ result: 'found', questions: expect.any(Number), wrong_guesses: 0 });
    expect(Object.keys(end?.[1] ?? {}).sort()).toEqual(['questions', 'result', 'wrong_guesses']);
  });

  it('logs game_end given_up and animal_missed with an animal id', async () => {
    await launch('granted');
    await fireEvent.press(screen.getByTestId('home-play'));
    for (let i = 0; i < 3; i++) {
      for (let g = 0; g < 30 && screen.queryByTestId('question-screen'); g++) await fireEvent.press(screen.getByTestId('answer-dontknow'));
      await fireEvent.press(screen.getByTestId('proposal-no'));
    }
    await fireEvent.press(screen.getByTestId('pick-bee'));
    const events = logged();
    expect(events).toContainEqual(['game_end', { result: 'given_up', questions: 30, wrong_guesses: 3 }]); // 20 + 5 + 5 (cap grows after each miss)
    expect(events).toContainEqual(['animal_missed', { animal: 'bee' }]);
  });

  it('logs game_end quit when the player leaves with Android back', async () => {
    let onBack: ((e: never) => boolean | null | undefined) | undefined;
    const spy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_e, fn) => {
      onBack = fn as (e: never) => boolean | null | undefined;
      return { remove: () => {} };
    });
    await launch('granted');
    await fireEvent.press(screen.getByTestId('home-play'));
    await fireEvent.press(screen.getByTestId('answer-yes'));
    await act(async () => {
      onBack?.(undefined as never);
    });
    expect(screen.getByTestId('home-screen')).toBeTruthy();
    expect(logged()).toContainEqual(['game_end', { result: 'quit', questions: 1, wrong_guesses: 0 }]);
    spy.mockRestore();
  });

  it('sends nothing when the statistics are refused', async () => {
    await launch('denied');
    await play('cat');
    await fireEvent.press(screen.getByTestId('proposal-yes'));
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('sends nothing once the statistics are turned off in the settings', async () => {
    await launch('granted');
    await fireEvent.press(screen.getByTestId('home-settings'));
    await fireEvent(screen.getByTestId('settings-telemetry'), 'valueChange', false);
    await fireEvent.press(screen.getByTestId('settings-back'));
    await play('cat');
    expect(logEvent).not.toHaveBeenCalled();
  });
});
