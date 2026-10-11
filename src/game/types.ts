// Game data model. Facts are indexed like `GameData.questions`.
export type Fact = 'y' | 'n' | 'v';

export type Question = {
  id: string;
  text: string;
};

export type Animal = {
  id: string;
  name: string; // display name, e.g. "Ours polaire"
  spoken: string; // name with article, e.g. "l'ours polaire"
  emoji: string;
  facts: Fact[];
};

export type GameData = {
  questions: Question[];
  animals: Animal[];
};
