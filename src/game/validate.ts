// Data quality checks (PRD "Rules and scoring > Data"). Pure functions used by the tests.
import { GameData } from './types';

export const GENERIC_NAMES_BY_LANGUAGE = {
  fr: ['Poisson', 'Singe', 'Serpent', 'Oiseau', 'Insecte'],
  en: ['Fish', 'Monkey', 'Snake', 'Bird', 'Insect'],
};
export const GENERIC_NAMES = GENERIC_NAMES_BY_LANGUAGE.fr;

// The spoken name carries its article: « la girafe », « a giraffe ».
const SPOKEN_ARTICLE = { fr: /^(le |la |l'|les )/, en: /^(a |an )/ };

type DataLanguage = keyof typeof GENERIC_NAMES_BY_LANGUAGE;
export const MIN_ANIMALS = 215;
export const MAX_ANIMALS = 235;
export const MIN_STRONG_DIFFERENCES = 2;
export const MIN_QUESTIONS = 110;
export const MAX_QUESTIONS_IN_DATA = 120;

// Questions where one animal is "y" and the other "n".
export function strongDifferences(data: GameData, i: number, j: number): number {
  const a = data.animals[i].facts;
  const b = data.animals[j].facts;
  let n = 0;
  for (let q = 0; q < a.length; q++) if ((a[q] === 'y' && b[q] === 'n') || (a[q] === 'n' && b[q] === 'y')) n++;
  return n;
}

export function closePairs(data: GameData, min = MIN_STRONG_DIFFERENCES): string[] {
  const out: string[] = [];
  for (let i = 0; i < data.animals.length; i++) {
    for (let j = i + 1; j < data.animals.length; j++) {
      const d = strongDifferences(data, i, j);
      if (d < min) out.push(`${data.animals[i].id}/${data.animals[j].id} (${d})`);
    }
  }
  return out;
}

export function structuralProblems(data: GameData, language: DataLanguage = 'fr'): string[] {
  const p: string[] = [];
  const n = data.animals.length;
  if (n < MIN_ANIMALS || n > MAX_ANIMALS) p.push(`${n} animals, expected ${MIN_ANIMALS}-${MAX_ANIMALS}`);
  const nq = data.questions.length;
  if (nq < MIN_QUESTIONS || nq > MAX_QUESTIONS_IN_DATA) p.push(`${nq} questions, expected ${MIN_QUESTIONS}-${MAX_QUESTIONS_IN_DATA}`);
  const seen = (key: 'id' | 'name' | 'spoken') => {
    const s = new Set<string>();
    for (const a of data.animals) {
      if (s.has(a[key])) p.push(`duplicate ${key}: ${a[key]}`);
      s.add(a[key]);
    }
  };
  seen('id');
  seen('name');
  seen('spoken');
  const qIds = new Set<string>();
  for (const q of data.questions) {
    if (qIds.has(q.id)) p.push(`duplicate question id: ${q.id}`);
    qIds.add(q.id);
    if (!q.text.trim()) p.push(`empty question: ${q.id}`);
  }
  for (const a of data.animals) {
    if (!/^[a-z][a-z0-9_]*$/.test(a.id)) p.push(`id not lowercase snake_case: ${a.id}`);
    if (a.facts.length !== data.questions.length) p.push(`${a.id}: ${a.facts.length} facts for ${data.questions.length} questions`);
    if (a.facts.some((f) => f !== 'y' && f !== 'n' && f !== 'v')) p.push(`${a.id}: invalid fact`);
    if (!a.emoji.trim()) p.push(`${a.id}: no emoji`);
    if (!SPOKEN_ARTICLE[language].test(a.spoken)) p.push(`${a.id}: spoken name without article: ${a.spoken}`);
    if (GENERIC_NAMES_BY_LANGUAGE[language].includes(a.name)) p.push(`generic animal: ${a.name}`);
  }
  return p;
}
