import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getTicketId } from "../storage/storage";

export function useRestoreTicket() {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    getTicketId().then((ticketId) => {
      if (!active) return;
      if (ticketId) {
        router.replace({
          pathname: "/waiting/[ticketId]",
          params: { ticketId },
        });
      } else {
        setIsRestoring(false);
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  return { isRestoring };
}
