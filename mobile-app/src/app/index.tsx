import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ReasonDto } from '@/api/generated';
import { API_BASE_URL, reasonsApi } from '@/config';

export default function HomeScreen() {
  const [reasons, setReasons] = useState<ReasonDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReasons() {
    setLoading(true);
    setError(null);
    try {
      setReasons(await reasonsApi.reasonsControllerFindAll());
    } catch (error: any) {
      setError(`Could not connect to ${API_BASE_URL}. ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={loadReasons}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Load reasons</Text>
          )}
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}
        {reasons.map((reason) => (
          <Text key={reason.code} style={styles.reason}>
            {reason.label}
          </Text>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  button: {
    minWidth: 140,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#176b5b',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#b42318',
    textAlign: 'center',
  },
  reason: {
    color: '#202725',
    fontSize: 16,
  },
});
