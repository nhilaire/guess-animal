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

  it('AC-35: Home « À propos » shows the story, the word from the author, the data and the version', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('home-about'));
    expect(screen.getByTestId('about-screen')).toBeTruthy();
    expect(screen.getByText(/petit jeu électronique/)).toBeTruthy();
    expect(screen.getByText(/développeur passionné/)).toBeTruthy();
    expect(screen.getByText(/pas exempt de bugs/)).toBeTruthy();
    expect(screen.getByText(/Aucun compte, aucune publicité/)).toBeTruthy();
    expect(screen.getByText('Version 0.2.3')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('about-back'));
    expect(screen.getByTestId('home-screen')).toBeTruthy();
  });
});
