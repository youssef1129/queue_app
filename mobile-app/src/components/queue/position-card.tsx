import { StyleSheet, Text, View } from 'react-native';

import type { TicketResponseDto } from '@/api/generated';
import { HealthcareTheme as theme } from '@/constants/theme';

export function PositionCard({ ticket }: { ticket: TicketResponseDto }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Votre position</Text>
      <Text
        accessibilityLabel={`Position ${ticket.position} dans la file`}
        accessibilityRole="text"
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.position}>
        {ticket.position}
      </Text>
      <Text style={styles.wait}>
        Temps d’attente estimé : {ticket.estimatedWaitMinutes} min
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.muted,
    fontSize: 16,
  },
  position: {
    maxWidth: '100%',
    color: theme.colors.primary,
    fontSize: 72,
    fontWeight: '700',
    lineHeight: 84,
  },
  wait: {
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
});