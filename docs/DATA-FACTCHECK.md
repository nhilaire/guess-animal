# Data fact-check: v0.2.0 additions

Independent fact-check (separate agent, read-only) of the data added in v0.2.0: 78 new animals against all questions,
24 new questions against all 224 animals, French names and question wording. Date: 2026-10-12.
Format: `animal | question | before -> after | reason`. Every finding below was applied (commit "fix(data): apply the
v0.2.0 fact-check"), except where stated.

## New animals

| Animal | Question | Change | Reason |
|---|---|---|---|
| kiwi | australia | v -> n | the kiwi lives only in New Zealand |
| dromedary | spits | v -> y | dromedaries spit like camels and llamas |
| dromedary | asia | v -> y | Arabian Peninsula and India are in Asia |
| dromedary | australia | n -> v | Australia has a large feral dromedary population |
| gecko | teeth | n -> y | geckos have many small teeth, like the lizard |
| catfish | big | y -> v | the French poisson-chat is 25-35 cm; the giant is the silure |
| trout | small | n -> v | 30-40 cm, about a cat's length |
| crayfish | legs8 | n -> v | same body plan as the lobster (legs8 = v) |
| polar_fox | changes_color | n -> v | coat brown in summer, white in winter |

## Existing animals on the new questions

| Animal | Question | Change | Reason |
|---|---|---|---|
| anteater | long_nose | n -> y | its long snout is its defining feature |
| bison | hump | n -> v | big shoulder hump |
| whale | hump | n -> v | the humpback whale (baleine à bosse) |
| tiger | jungle | v -> y | Indian and Sumatran jungles |
| cobra | jungle | n -> v | Indian and king cobras live in the jungle |
| snail | tiny | n -> y | a garden snail is smaller than a mouse |
| shrimp | tiny | n -> y | about 5 cm |
| slug, earthworm, dragonfly, scorpion, seahorse, goldfish | tiny | n -> v | size debatable |
| seahorse | changes_color | n -> v | seahorses change colour |
| snail | teeth | n -> v | « l'escargot a des milliers de dents » (radula) |
| lizard | wall_climb | v -> y | the French « lézard des murailles » lives on walls |
| wasp, bee | wall_climb | n -> v | they walk on walls and windows |

## Question wording (applied, voice clips regenerated)

| Question | New wording | Reason |
|---|---|---|
| rolls_ball | Est-ce qu'il se roule en boule pour se protéger ? | a sleeping cat also curls up |
| long_nose | Est-ce qu'il a une trompe comme l'éléphant ou un très long nez ? | insects have a « trompe » too |
| parasite | Est-ce qu'il vit sur d'autres animaux ou sur les gens ? | children may not count humans as animals |
| crest | Est-ce qu'il a une crête ou une huppe sur la tête ? | cockatoo, jay, crane have a « huppe » |
| tiny | Est-ce qu'il est plus petit qu'une souris, sans compter la queue ? | length vs tail ambiguity |
| spits | Est-ce qu'il crache, comme le lama ? | avoids confusion with « crache de l'encre » |

Not applied: « Yack » kept (valid spelling). Names and articles of the 78 new animals: all correct.

## Distinguishability adjustments (after the merge and after the fact-check)

Needed so that every pair of animals differs on at least 2 yes/no questions (AC-04). Each is a factual answer:
new questions « Est-ce qu'il habite dans la coquille d'un autre animal ? » (hermit crab) and « Est-ce qu'il vit dans
les cheveux ? » (louse); mole black; weasel does not dig its burrow; camel not in Africa; sperm whale bigger than an
elephant and not seen from French coasts; orca not bigger than an elephant; dolphin seen in France; whale sings; moray
active at night; sea anemone brightly coloured; pike green and spotted; eel nocturnal and not longer than an adult;
salmon jumps; trout in mountains and farmed; dove not in flocks; quail speckled, its eggs eaten; leopard gecko is a
pet; poisson-chat black and native to America.
