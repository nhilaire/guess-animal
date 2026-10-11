// Every player-facing string lives here, in French (tone: tu). Components never inline text.
// `typo` applies French typography: no-break space before ? ! : ; (source text stays readable).
import { NBSP } from './format';

export const typo = (s: string): string => s.replace(/[   ]*([?!:;])/g, `${NBSP}$1`);

export const fr = {
  consent: {
    title: 'Statistiques anonymes',
    body: typo(
      "Pour améliorer le jeu, Devine l'Animal peut envoyer des statistiques anonymes (parties jouées, animaux trouvés ou non, plantages). Aucune donnée personnelle. Tu peux changer d'avis dans les paramètres.",
    ),
    accept: 'Accepter',
    refuse: 'Refuser',
  },
  home: {
    pitch: typo('Pense à un animal… je vais le deviner !'),
    play: 'Jouer',
    settings: 'Paramètres',
  },
  game: {
    counter: (n: number) => `Question ${n}`,
    yes: 'Oui',
    no: 'Non',
    dontKnow: 'Je ne sais pas',
    replay: 'Réécouter',
    undo: 'Revenir',
  },
  proposal: {
    question: (spoken: string) => typo(`Est-ce que c'est ${spoken} ?`),
  },
  victory: {
    title: typo("J'ai trouvé !"),
    body: (spoken: string) => `C'était ${spoken}.`,
    questions: (n: number) => (n <= 1 ? `En ${n} question.` : `En ${n} questions.`),
  },
  giveUp: {
    title: typo('Je donne ma langue au chat !'),
    body: typo('À quel animal pensais-tu ?'),
    notListed: "Il n'est pas dans la liste",
  },
  thanks: {
    body: typo('Merci ! Je ferai mieux la prochaine fois.'),
  },
  common: {
    playAgain: 'Rejouer',
    home: 'Accueil',
  },
  settings: {
    title: 'Paramètres',
    sound: 'Son',
    vibrations: 'Vibrations',
    stats: 'Statistiques anonymes',
    statsHelp: "Aide à corriger les erreurs et à améliorer le jeu. Aucune donnée personnelle n'est envoyée.",
    back: 'Retour',
  },
  errors: {
    title: 'Oups',
    body: 'Un problème est survenu. Relance le jeu.',
    retry: 'Réessayer',
  },
} as const;
