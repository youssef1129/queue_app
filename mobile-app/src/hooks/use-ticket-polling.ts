import { useCallback, useEffect, useRef, useState } from "react";

import {
    TicketResponseDtoStatusEnum,
    type TicketResponseDto,
} from "@/api/generated";
import { ticketsApi } from "@/config";
import { getApiErrorMessage, getApiErrorStatus } from "@/utils/api-error";

const POLL_INTERVAL_MS = 10_000;

export function useTicketPolling(ticketId: string) {
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
    let timer: ReturnType<typeof setTimeout> | undefined;
    let currentTicket: TicketResponseDto | null = null;

    const fetchTicket = async (silent: boolean) => {
      if (!active || inFlight || stopped) return;
      inFlight = true;
      if (silent) setIsRefreshing(true);
      else if (!currentTicket) setIsLoading(true);

      try {
        const result = await ticketsApi.ticketsControllerFindOne({
          id: ticketId,
        });
        if (!active) return;
        currentTicket = result;
        setTicket(result);
        setError(null);
        setIsNotFound(false);
        if (result.status !== TicketResponseDtoStatusEnum.WAITING)
          stopped = true;
      } catch (requestError: unknown) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "ticket"));
        const notFound = getApiErrorStatus(requestError) === 404;
        setIsNotFound(notFound);
        if (notFound) stopped = true;
      } finally {
        inFlight = false;
        if (!active) return;
        setIsLoading(false);
        setIsRefreshing(false);
        if (
          !stopped &&
          currentTicket?.status === TicketResponseDtoStatusEnum.WAITING
        ) {
          timer = setTimeout(() => void fetchTicket(true), POLL_INTERVAL_MS);
        }
      }
    };

    retryRef.current = () => {
      if (timer) clearTimeout(timer);
      void fetchTicket(currentTicket !== null);
    };
    void fetchTicket(false);

    return () => {
      active = false;
      stopped = true;
      if (timer) clearTimeout(timer);
      retryRef.current = null;
    };
  }, [ticketId]);

  return { ticket, isLoading, error, isRefreshing, isNotFound, retry };
}
