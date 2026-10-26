// Real feedback: bundled voice clips and sound effects with expo-audio, vibrations with expo-haptics.
// Errors are reported (if consented) and never crash the game.
import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { reportError } from '../telemetry/telemetry';
import { Effect, Feedback, Line } from './feedback';
import { Clip, VOICE } from './manifest.generated';

const EFFECTS: Record<Effect, number> = {
  win: require('../../assets/sounds/win.wav'),
  lose: require('../../assets/sounds/lose.wav'),
};

export function createExpoFeedback(): Feedback {
  let voice: AudioPlayer | null = null;
  let effects: AudioPlayer | null = null;
  let queue: number[] = [];

  const safe = (context: string, fn: () => void) => {
    try {
      fn();
    } catch (error) {
      reportError(error, context);
    }
  };

  const playOn = (which: 'voice' | 'effects', source: number) =>
    safe(`audio_${which}`, () => {
      let p = which === 'voice' ? voice : effects;
      if (!p) {
        p = createAudioPlayer(source);
        if (which === 'voice') {
          voice = p;
          // Chained clips (then): start the next one when the current clip ends.
          p.addListener('playbackStatusUpdate', (status) => {
            const next = status.didJustFinish ? queue.shift() : undefined;
            if (next !== undefined) playOn('voice', next);
          });
        } else effects = p;
      } else {
        p.replace(source);
      }
      void p.seekTo(0);
      p.play();
    });

  const speak = (clip: Clip | undefined) => {
    queue = [];
    if (clip) playOn('voice', clip.source);
  };

  return {
    question: (id, language) => speak(VOICE[language].questions[id]),
    proposal: (id, language) => speak(VOICE[language].proposals[id]),
    line: (line: Line, language) => speak(VOICE[language].lines[line]),
    then: (line: Line, language) => {
      const clip = VOICE[language].lines[line];
      if (clip) queue.push(clip.source);
    },
    effect: (effect) => playOn('effects', EFFECTS[effect]),
    vibrate: () =>
      safe('haptics', () => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }),
    stop: () =>
      safe('audio_stop', () => {
        queue = [];
        voice?.pause();
      }),
  };
}
