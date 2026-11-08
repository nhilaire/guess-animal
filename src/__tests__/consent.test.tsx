import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { saveConsent } from '../telemetry/consentStore';
import * as telemetry from '../telemetry/telemetry';

// T-37: a failed consent write must neither throw nor leave the player stuck on the consent screen.
const writeFails = () => jest.spyOn(AsyncStorage, 'setItem').mockRejectedValue(new Error('disk full'));

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => jest.restoreAllMocks());

describe('consent write failure (AC-02, AC-21)', () => {
  it('saveConsent catches the error and reports it', async () => {
    const report = jest.spyOn(telemetry, 'reportError').mockImplementation(() => {});
    writeFails();
    await expect(saveConsent('granted')).resolves.toBeUndefined();
    expect(report).toHaveBeenCalledWith(expect.any(Error), 'save_consent');
  });

  it('« Refuser » still shows Home when the write fails', async () => {
    writeFails();
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('consent-refuse'));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
  });

  it('« Accepter » still shows Home when applying the consent throws', async () => {
    jest.spyOn(telemetry, 'applyConsent').mockRejectedValue(new Error('firebase down'));
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('consent-accept'));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
  });
});
