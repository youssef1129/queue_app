import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ReasonCode } from '@/api/generated';
import { ErrorView } from '@/components/queue/error-view';
import { PrimaryButton } from '@/components/queue/primary-button';
import { ReasonList } from '@/components/queue/reason-list';
import { ScreenContainer } from '@/components/queue/screen-container';
import { SkeletonBlock } from '@/components/queue/skeleton-block';
import { HealthcareTheme as theme } from '@/constants/theme';
import { useJoinQueue } from '@/hooks/use-join-queue';
import { useReasons } from '@/hooks/use-reasons';
import { useRestoreTicket } from '@/hooks/useRestoreTicket';
import { saveTicketId } from '@/storage/storage';

export default function HomeScreen() {
  const router = useRouter();
  const { reasons, isLoading, error, retry } = useReasons();
  const { join, isJoining, error: joinError, clearError } = useJoinQueue();
  const [selectedReason, setSelectedReason] = useState<ReasonCode | null>(null);
  const { isRestoring } = useRestoreTicket();

  async function joinQueue() {
    if (!selectedReason) return;
    const ticket = await join(selectedReason);
    if (ticket) {
      await saveTicketId(ticket.id);
      router.push({ pathname: '/waiting/[ticketId]', params: { ticketId: ticket.id } });
    }
  }

  if (isRestoring) {
    return (
      <ScreenContainer>
        <SkeletonBlock width="100%" height={66} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>TÉLÉCONSULTATION</Text>
        <Text style={styles.title}>Comment pouvons-nous vous aider ?</Text>
        <Text style={styles.description}>Choisissez le motif de votre consultation.</Text>
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          <SkeletonBlock width="100%" height={66} />
          <SkeletonBlock width="100%" height={66} />
          <SkeletonBlock width="100%" height={66} />
        </View>
      ) : (
        <>
          {error && <ErrorView message={error} onRetry={() => void retry()} inline={reasons.length > 0} />}
          {reasons.length > 0 ? (
            <ReasonList
              reasons={reasons}
              selectedCode={selectedReason}
              onSelect={(code) => {
                setSelectedReason(code);
                clearError();
              }}
            />
          ) : !error ? (
            <Text style={styles.empty}>Aucun motif n’est disponible pour le moment.</Text>
          ) : null}
        </>
      )}

      {joinError && <ErrorView message={joinError} onRetry={() => void joinQueue()} inline />}
      <PrimaryButton
        label="Rejoindre la file"
        accessibilityLabel="Rejoindre la file d’attente"
        onPress={() => void joinQueue()}
        disabled={!selectedReason || isLoading}
        loading={isJoining}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 29,
    fontWeight: '700',
    lineHeight: 36,
  },
  description: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  skeletonList: {
    gap: theme.spacing.sm,
  },
  empty: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
});
