// English translation of fr.ts (same keys, enforced by the Strings type). Tone: neutral « you », US English (like the
// en-US voice). English typography: no space before ": ! ?". The fixed spoken sentences must equal the English lines
// of scripts/generate-audio.mjs (checked by a test).
import type { Strings } from './types';

export const en: Strings = {
  locale: 'en-US',
  consent: {
    title: 'Anonymous statistics',
    body:
      'To improve the game, Guess the Animal can send anonymous statistics (games played, animals found or not, crashes). ' +
      'No personal data. You can change your mind in the settings.',
    accept: 'Accept',
    refuse: 'Decline',
  },
  home: {
    pitch: "Hi! I'm going to read your mind. Think of an animal…",
    play: 'Play',
    settings: 'Settings',
    about: 'About',
  },
  about: {
    title: 'About',
    storyTitle: 'The story of this game',
    story: [
      'As a child, I had a little electronic game that could guess which animal you were thinking of, just by asking ' +
        'questions. It seemed like magic to me. It disappeared long ago: I wanted to recreate it, even better, to play it with my children.',
    ],
    authorTitle: 'A word from the author',
    author: [
      'This game does not come from a studio: I imagined and programmed it in my free time, as a passionate developer, without pretension.',
      "So it is far from perfect and probably not free of bugs. If I can't find your animal or a question seems odd, " +
        'thank you in advance for your patience. Above all: have fun!',
    ],
    dataTitle: 'Your data',
    data: [
      'No account, no ads. Anonymous statistics (games played, animals found or not, crashes) are only sent if you ' +
        'agreed. You can change your mind in the settings.',
    ],
    version: (version: string) => `Version ${version}`,
    back: 'Back',
  },
  game: {
    counter: (n: number) => `Question ${n}`,
    yes: 'Yes',
    no: 'No',
    dontKnow: "I don't know",
    replay: 'Listen again',
    undo: 'Go back',
  },
  proposal: {
    question: (spoken: string) => `I've got it! Is it ${spoken}?`,
  },
  victory: {
    title: "Yippee, I'm so good!",
    body: (spoken: string) => `It was ${spoken}.`,
    questions: (n: number) => (n === 1 ? `In ${n} question.` : `In ${n} questions.`),
  },
  giveUp: {
    title: "Well done, you're really good!",
    body: 'Which animal were you thinking of?',
    notListed: "It's not in the list",
  },
  thanks: {
    body: "Thank you! I'll do better next time.",
  },
  common: {
    playAgain: 'Play again',
    home: 'Home',
  },
  settings: {
    title: 'Settings',
    sound: 'Sound',
    vibrations: 'Vibrations',
    stats: 'Anonymous statistics',
    statsHelp: 'Helps fix errors and improve the game. No personal data is sent.',
    language: 'Language',
    languageAuto: 'Automatic (phone language)',
    back: 'Back',
  },
  errors: {
    title: 'Oops',
    body: 'Something went wrong. Restart the game.',
    retry: 'Try again',
  },
};
