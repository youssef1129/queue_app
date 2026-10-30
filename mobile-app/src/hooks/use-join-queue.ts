import { useRef, useState } from "react";

import { ReasonCode, type TicketResponseDto } from "@/api/generated";
import { ticketsApi } from "@/config";
import { getApiErrorMessage } from "@/utils/api-error";

export function useJoinQueue() {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  async function join(reason: ReasonCode): Promise<TicketResponseDto | null> {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    setIsJoining(true);
    setError(null);

    try {
      return await ticketsApi.ticketsControllerCreate({
        createTicketDto: { reason },
      });
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "join"));
      return null;
    } finally {
      inFlightRef.current = false;
      setIsJoining(false);
    }
  }

  return { join, isJoining, error, clearError: () => setError(null) };
}
