import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { HealthcareTheme as theme } from '@/constants/theme';

interface PrimaryButtonProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
  secondary?: boolean;
}

export function PrimaryButton({
  label,
  accessibilityLabel,
  onPress,
  disabled = false,
  loading = false,
  destructive = false,
  secondary = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        destructive && styles.destructive,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={secondary ? theme.colors.primary : theme.colors.surface} />
      ) : (
        <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  destructive: {
    backgroundColor: theme.colors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  label: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryLabel: {
    color: theme.colors.primary,
  },
});