import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { APP_NAME, APP_VERSION } from '../config/app';
import { deviceLanguageTags } from '../i18n/deviceLocale';

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
    expect(screen.getByText(`Version ${APP_VERSION}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('about-back'));
    expect(screen.getByTestId('home-screen')).toBeTruthy();
  });
});

describe('languages (AC-36, AC-37)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.mocked(deviceLanguageTags).mockReturnValue(['fr-FR']);
  });

  it('speaks English on an English phone, with the English app name', async () => {
    jest.mocked(deviceLanguageTags).mockReturnValue(['en-US']);
    await render(<App />);
    expect(await screen.findByText('Anonymous statistics')).toBeTruthy();
    await fireEvent.press(screen.getByText('Decline'));
    expect(await screen.findByText('Play')).toBeTruthy();
    expect(screen.getByText('Guess the Animal')).toBeTruthy();
  });

  it('uses English on a phone in an unsupported language', async () => {
    jest.mocked(deviceLanguageTags).mockReturnValue(['it-IT']);
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    expect(await screen.findByText('Play')).toBeTruthy();
  });

  it('switches language from the settings at once and remembers the choice', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('home-settings'));
    await fireEvent.press(screen.getByTestId('settings-language-en'));
    expect(await screen.findByText('Settings')).toBeTruthy();
    expect(screen.getByText('Sound')).toBeTruthy();
    expect(await AsyncStorage.getItem('settings.language.v1')).toBe('en');

    await screen.unmount();
    await render(<App />);
    expect(await screen.findByText('Play')).toBeTruthy();
  });

  it('goes back to the phone language with the automatic choice', async () => {
    await AsyncStorage.multiSet([
      ['telemetry.consent.v1', 'denied'],
      ['settings.language.v1', 'en'],
    ]);
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('home-settings'));
    await fireEvent.press(screen.getByTestId('settings-language-auto'));
    expect(await screen.findByText('Paramètres')).toBeTruthy();
  });
});
