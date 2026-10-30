import { StyleSheet, Text, View } from 'react-native';

import { HealthcareTheme as theme } from '@/constants/theme';
import { PrimaryButton } from './primary-button';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  inline?: boolean;
  retryLabel?: string;
}

export function ErrorView({ message, onRetry, inline = false, retryLabel = 'Réessayer' }: ErrorViewProps) {
  return (
    <View accessibilityRole="alert" style={[styles.container, inline && styles.inline]}>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton
        label={retryLabel}
        accessibilityLabel={retryLabel}
        onPress={onRetry}
        secondary={inline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inline: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warningBackground,
    borderColor: 'transparent',
  },
  message: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});