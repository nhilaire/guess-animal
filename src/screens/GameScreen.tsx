import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler } from 'react-native';

import { feedback } from '../audio/feedback';
import { GAME_DATA } from '../game/data.generated';
import { Answer, GameState, answerProposal, answerQuestion, newGame, undo } from '../game/inference';
import { Settings } from '../storage/settings';
import { track } from '../telemetry/telemetry';
import { GiveUpView, ProposalView, QuestionView, ThanksView, VictoryView } from './GameViews';

const data = GAME_DATA;
// The engine is deterministic: the opening state is always the same, computed once.
const OPENING: GameState = newGame(data);

type Props = { settings: Settings; onExit: () => void };

export function GameScreen({ settings, onExit }: Props) {
  const [state, setState] = useState<GameState>(OPENING);
  const [thanks, setThanks] = useState(false);
  const [round, setRound] = useState(0);
  const ended = useRef(false);
  const sortedAnimals = useMemo(() => [...data.animals].sort((a, b) => a.name.localeCompare(b.name, 'fr')), []);

  // One game_start per round.
  useEffect(() => {
    ended.current = false;
    track('game_start', {});
  }, [round]);

  // End of round: telemetry once, sounds and haptics.
  useEffect(() => {
    if (state.phase !== 'found' && state.phase !== 'gaveUp') return;
    if (ended.current) return;
    ended.current = true;
    const won = state.phase === 'found';
    track('game_end', { result: won ? 'found' : 'given_up', questions: state.questionsAnswered, wrong_guesses: state.wrongGuesses });
    if (settings.sound) {
      feedback().effect(won ? 'win' : 'lose');
      feedback().line(won ? 'victory' : 'giveUp');
      if (!won) feedback().then('giveUpBody');
    }
    if (settings.vibrations) feedback().vibrate();
  }, [state, settings]);

  // Speak the current question or proposal.
  useEffect(() => {
    if (!settings.sound) return;
    if (state.phase === 'question') feedback().question(data.questions[state.current].id);
    else if (state.phase === 'proposal') feedback().proposal(data.animals[state.current].id);
  }, [state.phase, state.current, round, settings.sound]);

  const quit = useCallback(() => {
    feedback().stop();
    if (!ended.current) {
      ended.current = true;
      track('game_end', { result: 'quit', questions: state.questionsAnswered, wrong_guesses: state.wrongGuesses });
    }
    onExit();
  }, [state, onExit]);

  // Android back: leave the game.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      quit();
      return true;
    });
    return () => sub?.remove();
  }, [quit]);

  // Background: silence; the game state is kept as it is.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') feedback().stop();
    });
    return () => sub?.remove();
  }, []);

  const playAgain = () => {
    feedback().stop();
    setState(OPENING);
    setThanks(false);
    setRound((r) => r + 1);
  };

  const onAnswer = (a: Answer) => {
    feedback().stop();
    setState((s) => answerQuestion(data, s, a));
  };

  const onProposal = (correct: boolean) => {
    feedback().stop();
    setState((s) => answerProposal(data, s, correct));
  };

  const onPick = (animal: string) => {
    track('animal_missed', { animal });
    if (settings.sound) feedback().line('thanks');
    setThanks(true);
  };

  if (thanks) return <ThanksView onPlayAgain={playAgain} onHome={quit} />;

  switch (state.phase) {
    case 'question':
      return (
        <QuestionView
          question={data.questions[state.current]}
          number={state.questionsAnswered + 1}
          canUndo={state.history.length > 0}
          onAnswer={onAnswer}
          onReplay={() => settings.sound && feedback().question(data.questions[state.current].id)}
          onUndo={() => {
            feedback().stop();
            setState(undo);
          }}
        />
      );
    case 'proposal':
      return <ProposalView animal={data.animals[state.current]} onAnswer={onProposal} />;
    case 'found':
      return <VictoryView animal={data.animals[state.current]} questions={state.questionsAnswered} onPlayAgain={playAgain} onHome={quit} />;
    case 'gaveUp':
      return <GiveUpView animals={sortedAnimals} onPick={onPick} />;
  }
}
