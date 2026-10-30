import { Pressable, StyleSheet, Text } from 'react-native';

import type { ReasonDto } from '@/api/generated';
import { HealthcareTheme as theme } from '@/constants/theme';

interface ReasonCardProps {
  reason: ReasonDto;
  selected: boolean;
  onPress: () => void;
}

export function ReasonCard({ reason, selected, onPress }: ReasonCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={reason.label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{reason.label}</Text>
      <Text style={[styles.indicator, selected && styles.selectedIndicator]} accessibilityElementsHidden>
        {selected ? '✓' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selected: {
    borderColor: theme.colors.selectedBorder,
    backgroundColor: theme.colors.selected,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  selectedLabel: {
    fontWeight: '700',
  },
  indicator: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    color: theme.colors.surface,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  selectedIndicator: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
});