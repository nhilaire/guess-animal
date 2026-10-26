// Presentational views of a game. No rule here: GameScreen owns the state and the callbacks.
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n/I18nProvider';
import { Animal, Question } from '../game/types';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing } from '../ui/theme';

type QuestionProps = {
  question: Question;
  number: number;
  canUndo: boolean;
  onAnswer: (a: 'yes' | 'no' | 'dontKnow') => void;
  onReplay: () => void;
  onUndo: () => void;
};

export function QuestionView({ question, number, canUndo, onAnswer, onReplay, onUndo }: QuestionProps) {
  const { t } = useI18n();
  return (
    <Screen testID="question-screen">
      <Text style={styles.counter} testID="game-counter">
        {t.game.counter(number)}
      </Text>
      <View style={styles.center}>
        <Text style={styles.question} testID={`q-${question.id}`} accessibilityRole="header">
          {question.text}
        </Text>
      </View>
      <Button label={t.game.yes} icon="✓" variant="yes" large onPress={() => onAnswer('yes')} testID="answer-yes" />
      <Button label={t.game.no} icon="✗" variant="no" large onPress={() => onAnswer('no')} testID="answer-no" />
      <Button label={t.game.dontKnow} icon="?" variant="neutral" large onPress={() => onAnswer('dontKnow')} testID="answer-dontknow" />
      <View style={styles.row}>
        <View style={styles.half}>
          <Button label={t.game.replay} icon="🔊" variant="secondary" onPress={onReplay} testID="game-replay" />
        </View>
        <View style={styles.half}>
          <Button label={t.game.undo} icon="↩" variant="secondary" onPress={onUndo} disabled={!canUndo} testID="game-undo" />
        </View>
      </View>
    </Screen>
  );
}

export function ProposalView({ animal, onAnswer }: { animal: Animal; onAnswer: (correct: boolean) => void }) {
  const { t } = useI18n();
  return (
    <Screen testID="proposal-screen">
      <View style={styles.center}>
        <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {animal.emoji}
        </Text>
        <Text style={styles.question} testID="proposal-text" accessibilityRole="header">
          {t.proposal.question(animal.spoken)}
        </Text>
      </View>
      <Button label={t.game.yes} icon="✓" variant="yes" large onPress={() => onAnswer(true)} testID="proposal-yes" />
      <Button label={t.game.no} icon="✗" variant="no" large onPress={() => onAnswer(false)} testID="proposal-no" />
    </Screen>
  );
}

type EndProps = { onPlayAgain: () => void; onHome: () => void };

export function VictoryView({ animal, questions, onPlayAgain, onHome }: EndProps & { animal: Animal; questions: number }) {
  const { t } = useI18n();
  return (
    <Screen testID="victory-screen">
      <View style={styles.center}>
        <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {animal.emoji}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {t.victory.title}
        </Text>
        <Text style={styles.body}>{t.victory.body(animal.spoken)}</Text>
        <Text style={styles.body}>{t.victory.questions(questions)}</Text>
      </View>
      <Button label={t.common.playAgain} large onPress={onPlayAgain} testID="end-play-again" />
      <Button label={t.common.home} variant="secondary" onPress={onHome} testID="end-home" />
    </Screen>
  );
}

export const NOT_LISTED = 'not_listed';

export function GiveUpView({ animals, onPick }: { animals: Animal[]; onPick: (id: string) => void }) {
  const { t } = useI18n();
  return (
    <Screen testID="giveup-screen">
      <Text style={styles.title} accessibilityRole="header">
        {t.giveUp.title}
      </Text>
      <Text style={styles.body}>{t.giveUp.body}</Text>
      <FlatList
        style={styles.list}
        data={animals}
        keyExtractor={(a) => a.id}
        initialNumToRender={20}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" style={styles.item} onPress={() => onPick(item.id)} testID={`pick-${item.id}`}>
            <Text style={styles.itemText}>{`${item.emoji}  ${item.name}`}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable accessibilityRole="button" style={[styles.item, styles.notListed]} onPress={() => onPick(NOT_LISTED)} testID="pick-not-listed">
            <Text style={styles.itemText}>{t.giveUp.notListed}</Text>
          </Pressable>
        }
      />
    </Screen>
  );
}

export function ThanksView({ onPlayAgain, onHome }: EndProps) {
  const { t } = useI18n();
  return (
    <Screen testID="thanks-screen">
      <View style={styles.center}>
        <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          🐱
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {t.thanks.body}
        </Text>
      </View>
      <Button label={t.common.playAgain} large onPress={onPlayAgain} testID="end-play-again" />
      <Button label={t.common.home} variant="secondary" onPress={onHome} testID="end-home" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  counter: { color: colors.muted, fontSize: font.body, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  question: { color: colors.text, fontSize: font.question, fontWeight: '800', textAlign: 'center' },
  emoji: { fontSize: font.emoji },
  title: { color: colors.text, fontSize: font.title, fontWeight: '800', textAlign: 'center' },
  body: { color: colors.muted, fontSize: font.heading, textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  list: { flex: 1 },
  item: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, marginBottom: spacing.sm },
  notListed: { backgroundColor: colors.surfaceAlt },
  itemText: { color: colors.text, fontSize: font.body, fontWeight: '600' },
});
