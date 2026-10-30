import { TicketResponseDtoStatusEnum } from "@/api/generated";
import { notifyTicketCalled } from "@/notifications/notifications";
import { useEffect, useRef } from "react";

export function useCalledNotification(
  status: TicketResponseDtoStatusEnum | undefined,
) {
  const previous = useRef<TicketResponseDtoStatusEnum | undefined>(undefined);

  useEffect(() => {
    if (
      previous.current === TicketResponseDtoStatusEnum.WAITING &&
      status === TicketResponseDtoStatusEnum.CALLED
    ) {
      void notifyTicketCalled();
    }
    previous.current = status;
  }, [status]);
}
