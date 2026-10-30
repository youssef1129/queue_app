import { useCallback, useEffect, useRef, useState } from "react";

import type { ReasonDto } from "@/api/generated";
import { reasonsApi } from "@/config";
import { getApiErrorMessage } from "@/utils/api-error";

export function useReasons() {
  const [reasons, setReasons] = useState<ReasonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const inFlightRef = useRef(false);

  const loadReasons = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (mountedRef.current) setIsLoading(true);

    try {
      const result = await reasonsApi.reasonsControllerFindAll();
      if (mountedRef.current) {
        setReasons(result);
        setError(null);
      }
    } catch (requestError: unknown) {
      if (mountedRef.current)
        setError(getApiErrorMessage(requestError, "reasons"));
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadReasons();
    return () => {
      mountedRef.current = false;
    };
  }, [loadReasons]);

  return { reasons, isLoading, error, retry: loadReasons };
}
