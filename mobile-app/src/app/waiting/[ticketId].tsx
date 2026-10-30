import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { TicketResponseDtoStatusEnum } from '@/api/generated';
import { CalledBanner } from '@/components/queue/called-banner';
import { ErrorView } from '@/components/queue/error-view';
import { PositionCard } from '@/components/queue/position-card';
import { PrimaryButton } from '@/components/queue/primary-button';
import { ScreenContainer } from '@/components/queue/screen-container';
import { SkeletonBlock } from '@/components/queue/skeleton-block';
import { ticketsApi } from '@/config';
import { HealthcareTheme as theme } from '@/constants/theme';
import { useCalledNotification } from '@/hooks/use-called-notification';
import { useTicketPolling } from '@/hooks/use-ticket-polling';
import { clearTicketId } from '@/storage/storage';
import { getApiErrorMessage, getApiErrorStatus } from '@/utils/api-error';

export default function WaitingRoomRoute() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();

  if (!ticketId || Array.isArray(ticketId)) {
    return <MissingTicket onBack={() => router.replace('/')} />;
  }

  return <WaitingRoom ticketId={ticketId} />;
}

function WaitingRoom({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const { ticket, isLoading, error, isRefreshing, isNotFound, retry } = useTicketPolling(ticketId);
  useCalledNotification(ticket?.status);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (ticket?.status === TicketResponseDtoStatusEnum.CANCELLED) router.replace('/');
  }, [router, ticket?.status]);

  async function cancelTicket() {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await ticketsApi.ticketsControllerCancel({ id: ticketId });
      clearTicketId();
      router.replace('/');
    } catch (requestError: unknown) {
      if (getApiErrorStatus(requestError) === 404) {
        router.replace('/');
        return;
      }
      if (getApiErrorStatus(requestError) === 409) {
        void retry();
      } else {
        setCancelError(getApiErrorMessage(requestError, 'cancel'));
      }
    } finally {
      setIsCancelling(false);
    }
  }

  function confirmCancel() {
    Alert.alert('Quitter la file ?', 'Votre demande de consultation sera annulée.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter la file', style: 'destructive', onPress: () => void cancelTicket() },
    ]);
  }

  if (isLoading && !ticket) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Salle d’attente</Text>
        <View style={styles.skeletonCard}>
          <SkeletonBlock width="45%" height={20} />
          <SkeletonBlock width={112} height={84} radius={theme.radius.md} />
          <SkeletonBlock width="70%" height={20} />
        </View>
        <SkeletonBlock width="100%" height={54} />
      </ScreenContainer>
    );
  }

  if (!ticket && error) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Salle d’attente</Text>
        <ErrorView
          message={error}
          onRetry={() => (isNotFound ? router.replace('/') : retry())}
          retryLabel={isNotFound ? 'Retourner au choix du motif' : 'Réessayer'}
        />
      </ScreenContainer>
    );
  }

  if (!ticket) {
    return <MissingTicket onBack={() => router.replace('/')} />;
  }

  const isCalled = ticket.status === TicketResponseDtoStatusEnum.CALLED;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TÉLÉCONSULTATION</Text>
        <Text style={styles.title}>Salle d’attente</Text>
        <Text style={styles.description}>
          {isCalled ? 'Merci de votre patience.' : 'Votre place est réservée. Nous vous appellerons ici.'}
        </Text>
      </View>

      {isCalled ? <CalledBanner /> : <PositionCard ticket={ticket} />}

      {isRefreshing && (
        <View style={styles.refreshing}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.refreshingText}>Mise à jour</Text>
        </View>
      )}
      {error && <ErrorView message={error} onRetry={() => retry()} inline />}
      {isNotFound && (
        <PrimaryButton
          label="Retourner au choix du motif"
          accessibilityLabel="Retourner au choix du motif"
          onPress={() => router.replace('/')}
          secondary
        />
      )}
      {cancelError && (
        <ErrorView message={cancelError} onRetry={() => void cancelTicket()} inline />
      )}

      {!isCalled ? <PrimaryButton
        label="Quitter la file"
        accessibilityLabel="Quitter la file d’attente"
        onPress={confirmCancel}
        loading={isCancelling}
        destructive
      />
        : <PrimaryButton
          label="Retourner au choix du motif"
          accessibilityLabel="Retourner au choix du motif"
          onPress={() => { clearTicketId().then(() => router.replace('/')) }}
          secondary
        />
      }
    </ScreenContainer>
  );
}

function MissingTicket({ onBack }: { onBack: () => void }) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Ticket introuvable</Text>
      <Text style={styles.description}>Revenez au choix du motif pour rejoindre la file.</Text>
      <PrimaryButton
        label="Retourner au choix du motif"
        accessibilityLabel="Retourner au choix du motif"
        onPress={onBack}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
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
  skeletonCard: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  refreshing: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: theme.spacing.sm,
  },
  refreshingText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
});