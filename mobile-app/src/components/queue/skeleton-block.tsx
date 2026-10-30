import { StyleSheet, View, type DimensionValue } from 'react-native';

import { HealthcareTheme as theme } from '@/constants/theme';

interface SkeletonBlockProps {
  width: DimensionValue;
  height: number;
  radius?: number;
}

export function SkeletonBlock({ width, height, radius = theme.radius.sm }: SkeletonBlockProps) {
  return <View accessibilityElementsHidden style={[styles.block, { width, height, borderRadius: radius }]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#E4EEEE',
  },
});