import { useCallback, useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";

import {
  TicketResponseDtoStatusEnum,
  type TicketResponseDto,
} from "@/api/generated";
import { API_BASE_URL, ticketsApi } from "@/config";
import { getApiErrorMessage, getApiErrorStatus } from "@/utils/api-error";

const POLL_INTERVAL_MS = 10_000;
const RECONNECT_INTERVAL_MS = 30_000;
const STREAM_INTERRUPTED_MESSAGE = "Flux interrompu. Reprise par interrogation périodique.";

function parseTicket(data: string | null): TicketResponseDto | null {
  if (!data) return null;
  try {
    const value: unknown = JSON.parse(data);
    if (typeof value !== "object" || value === null) return null;
    const candidate = value as Partial<TicketResponseDto>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.reason !== "string" ||
      typeof candidate.position !== "number" ||
      typeof candidate.estimatedWaitMinutes !== "number" ||
      !Object.values(TicketResponseDtoStatusEnum).includes(candidate.status as TicketResponseDtoStatusEnum)
    ) return null;
    return candidate as TicketResponseDto;
  } catch {
    return null;
  }
}

export function useTicketStream(ticketId: string) {
  const [ticket, setTicket] = useState<TicketResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const retryRef = useRef<(() => void) | null>(null);

  const retry = useCallback(() => retryRef.current?.(), []);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let stopped = false;
    let source: EventSource | null = null;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let currentTicket: TicketResponseDto | null = null;

    const clearTimers = () => {
      if (pollTimer) clearTimeout(pollTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      pollTimer = undefined;
      reconnectTimer = undefined;
    };

    const acceptTicket = (next: TicketResponseDto) => {
      currentTicket = next;
      setTicket(next);
      setError(null);
      setIsNotFound(false);
      if (next.status !== TicketResponseDtoStatusEnum.WAITING) {
        stopped = true;
        clearTimers();
        source?.close();
        source = null;
      }
    };

    const schedulePolling = () => {
      if (!active || stopped || pollTimer) return;
      pollTimer = setTimeout(() => {
        pollTimer = undefined;
        void fetchTicket(true);
      }, POLL_INTERVAL_MS);
    };

    const scheduleReconnect = () => {
      if (!active || stopped || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, RECONNECT_INTERVAL_MS);
    };

    const streamFailed = () => {
      if (!active || stopped) return;
      source?.close();
      source = null;
      setError((previous) => previous ?? STREAM_INTERRUPTED_MESSAGE);
      schedulePolling();
      scheduleReconnect();
    };

    const connect = () => {
      if (!active || stopped || source) return;
      try {
        source = new EventSource(`${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/stream`, {
          pollingInterval: RECONNECT_INTERVAL_MS,
        });
      } catch {
        schedulePolling();
        scheduleReconnect();
        return;
      }
      source.addEventListener("open", () => {
        if (!active || stopped) return;
        if (pollTimer) clearTimeout(pollTimer);
        pollTimer = undefined;
        setError(null);
      });
      source.addEventListener("message", (event) => {
        if (!active || stopped) return;
        const next = parseTicket(event.data);
        if (next && next.id === ticketId) acceptTicket(next);
      });
      source.addEventListener("error", streamFailed);
      source.addEventListener("close", streamFailed);
    };

    const fetchTicket = async (silent: boolean) => {
      if (!active || inFlight || stopped) return;
      inFlight = true;
      if (silent) setIsRefreshing(true);
      else if (!currentTicket) setIsLoading(true);
      try {
        const result = await ticketsApi.ticketsControllerFindOne({ id: ticketId });
        if (!active) return;
        acceptTicket(result);
        if (!stopped && !source) connect();
      } catch (requestError: unknown) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "ticket"));
        const notFound = getApiErrorStatus(requestError) === 404;
        setIsNotFound(notFound);
        if (notFound) {
          stopped = true;
          clearTimers();
          source?.close();
          source = null;
        } else {
          schedulePolling();
          scheduleReconnect();
        }
      } finally {
        inFlight = false;
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    retryRef.current = () => {
      if (pollTimer) clearTimeout(pollTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      pollTimer = undefined;
      reconnectTimer = undefined;
      if (!source) void fetchTicket(currentTicket !== null);
    };
    void fetchTicket(false);

    return () => {
      active = false;
      stopped = true;
      clearTimers();
      source?.close();
      source = null;
      retryRef.current = null;
    };
  }, [ticketId]);

  return { ticket, isLoading, error, isRefreshing, isNotFound, retry };
}
