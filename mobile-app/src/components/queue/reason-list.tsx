import { StyleSheet, View } from 'react-native';

import type { ReasonCode, ReasonDto } from '@/api/generated';
import { HealthcareTheme as theme } from '@/constants/theme';
import { ReasonCard } from './reason-card';

interface ReasonListProps {
  reasons: ReasonDto[];
  selectedCode: ReasonCode | null;
  onSelect: (code: ReasonCode) => void;
}

export function ReasonList({ reasons, selectedCode, onSelect }: ReasonListProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.list}>
      {reasons.map((reason) => (
        <ReasonCard
          key={reason.code}
          reason={reason}
          selected={reason.code === selectedCode}
          onPress={() => onSelect(reason.code)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.sm,
  },
});