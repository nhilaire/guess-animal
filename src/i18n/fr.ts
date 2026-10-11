// Every player-facing string lives here, in French. Components never inline text.
import { label, NBSP } from './format';

export const fr = {
  consent: {
    title: 'Votre vie privée',
    body:
      "Nous aimerions mesurer de façon anonyme l'utilisation du jeu et détecter les plantages afin de l'améliorer. " +
      "Aucune donnée personnelle n'est collectée et rien n'est utilisé à des fins publicitaires.",
    accept: 'Accepter',
    refuse: 'Refuser',
    footnote: "Vous pourrez changer d'avis à tout moment dans les paramètres.",
  },
  home: {
    play: 'Jouer',
    settings: 'Paramètres',
    bestScore: (score: number) => label('Meilleur score', score),
  },
  game: {
    tap: `Touchez${NBSP}!`,
    score: (score: number) => label('Score', score),
    timeLeft: (seconds: number) => label('Temps', `${seconds}${NBSP}s`),
    over: 'Partie terminée',
    finalScore: (score: number) => label('Votre score', score),
    playAgain: 'Rejouer',
    home: 'Accueil',
  },
  settings: {
    title: 'Paramètres',
    telemetry: 'Partager des statistiques anonymes',
    telemetryHelp: "Aide à corriger les bugs et à améliorer le jeu. Aucune donnée personnelle n'est envoyée.",
    back: 'Retour',
  },
  errors: {
    title: 'Oups',
    body: 'Un problème est survenu. Relancez le jeu.',
    retry: 'Réessayer',
  },
} as const;
