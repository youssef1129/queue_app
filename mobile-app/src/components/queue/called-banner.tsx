import { StyleSheet, Text, View } from 'react-native';

import { HealthcareTheme as theme } from '@/constants/theme';

export function CalledBanner() {
  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <Text style={styles.title}>C’est votre tour</Text>
      <Text style={styles.description}>Veuillez vous préparer à rejoindre le professionnel de santé.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.successBackground,
  },
  title: {
    color: theme.colors.successText,
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});