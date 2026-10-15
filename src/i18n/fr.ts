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
    pitch: typo('Salut ! Je vais lire dans tes pensées. Pense à un animal…'),
    play: 'Jouer',
    settings: 'Paramètres',
    about: 'À propos',
  },
  // « À propos » (AC-35), texts approved by the user on 2026-10-15.
  about: {
    title: 'À propos',
    storyTitle: "L'histoire de ce jeu",
    story: [
      typo(
        "Enfant, j'avais un petit jeu électronique qui devinait à quel animal on pensait, rien qu'en posant des questions. " +
          "Ça me paraissait magique. Il a disparu depuis longtemps : j'ai voulu le recréer, en mieux, pour y jouer avec mes enfants.",
      ),
    ],
    authorTitle: "Un mot de l'auteur",
    author: [
      typo("Ce jeu ne sort pas d'un studio : je l'ai imaginé et programmé sur mon temps libre, en développeur passionné, sans prétention."),
      typo(
        'Il est donc perfectible et sans doute pas exempt de bugs. Si je ne trouve pas ton animal ou si une question te ' +
          "paraît bizarre, merci d'avance pour ton indulgence. Et surtout : amuse-toi bien !",
      ),
    ],
    dataTitle: 'Tes données',
    data: [
      'Aucun compte, aucune publicité. Des statistiques anonymes (parties jouées, animaux trouvés ou non, plantages) ne ' +
        "sont envoyées que si tu l'as accepté. Tu peux changer d'avis dans les paramètres.",
    ],
    version: (version: string) => `Version ${version}`,
    back: 'Retour',
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
    question: (spoken: string) => typo(`J'ai trouvé ! C'est ${spoken} ?`),
  },
  victory: {
    title: typo('Youpi, je suis trop fort !'),
    body: (spoken: string) => `C'était ${spoken}.`,
    questions: (n: number) => (n <= 1 ? `En ${n} question.` : `En ${n} questions.`),
  },
  giveUp: {
    title: typo('Bravo, tu es très fort !'),
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
