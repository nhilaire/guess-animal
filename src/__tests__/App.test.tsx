import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { APP_NAME } from '../config/app';

// render/fireEvent are awaited: asynchronous in React Native Testing Library 14+.
describe('App', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('asks for consent in French on first launch, then shows the home screen (AC-01, AC-02)', async () => {
    await render(<App />);
    expect(await screen.findByText('Statistiques anonymes')).toBeTruthy();
    expect(screen.getByText('Accepter')).toBeTruthy();
    await fireEvent.press(screen.getByText('Refuser'));
    expect(await screen.findByText('Jouer')).toBeTruthy();
    expect(screen.getByText(APP_NAME)).toBeTruthy();
    expect(await AsyncStorage.getItem('telemetry.consent.v1')).toBe('denied');
  });

  it('does not ask again once the player has chosen (AC-02)', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    expect(await screen.findByText('Jouer')).toBeTruthy();
    expect(screen.queryByText('Statistiques anonymes')).toBeNull();
  });
});
