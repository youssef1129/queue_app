import { act, renderHook, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  ResponseError,
  TicketResponseDtoStatusEnum as Status,
  type TicketResponseDto,
} from "@/api/generated";
import { ticketsApi } from "@/config";
import { useTicketStream } from "./use-ticket-stream";

jest.mock("@/config", () => ({
  API_BASE_URL: "http://localhost:7000",
  reasonsApi: {},
  ticketsApi: { ticketsControllerFindOne: jest.fn() },
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  private listeners: Record<string, ((event: { data: string | null }) => void)[]> = {};
  closed = false;
  constructor(readonly url: string) { MockEventSource.instances.push(this); }
  addEventListener(type: string, listener: (event: { data: string | null }) => void) {
    this.listeners[type] ??= [];
    this.listeners[type].push(listener);
  }
  emit(type: string, data: string | null = null) {
    for (const listener of this.listeners[type] ?? []) listener({ data });
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.emit("close");
  }
}

jest.mock("react-native-sse", () => ({
  __esModule: true,
  default: jest.fn((url: string) => new MockEventSource(url)),
}));

const findTicket = jest.mocked(ticketsApi.ticketsControllerFindOne);
const waitingTicket: TicketResponseDto = {
  id: "ticket-1",
  reason: "autre",
  status: Status.WAITING,
  position: 2,
  estimatedWaitMinutes: 10,
};

async function mountWaitingTicket() {
  let resolveTicket!: (value: TicketResponseDto) => void;
  findTicket.mockReturnValueOnce(new Promise((resolve) => { resolveTicket = resolve; }));
  const hook = await renderHook(() => useTicketStream(waitingTicket.id));
  await act(async () => resolveTicket(waitingTicket));
  return hook;
}

describe("useTicketStream", () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    MockEventSource.instances = [];
  });

  it("shows the initial REST ticket and opens one stream", async () => {
    let resolveTicket!: (value: TicketResponseDto) => void;
    findTicket.mockReturnValue(new Promise((resolve) => { resolveTicket = resolve; }));
    const { result } = await renderHook(() => useTicketStream(waitingTicket.id));

    expect(result.current.isLoading).toBe(true);
    await act(async () => resolveTicket(waitingTicket));
    await waitFor(() => expect(result.current.ticket).toEqual(waitingTicket));
    expect(result.current.isLoading).toBe(false);
    expect(MockEventSource.instances).toHaveLength(1);
  });

  it("keeps the last ticket and reports a failed polling refresh", async () => {
    jest.useFakeTimers();
    const { result } = await mountWaitingTicket();
    findTicket.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await act(async () => MockEventSource.instances[0].emit("error"));
    await act(async () => {
      jest.advanceTimersByTime(10_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(findTicket).toHaveBeenCalledTimes(2);
    expect(result.current.ticket).toEqual(waitingTicket);
    expect(result.current.error).toBe(
      "Impossible de joindre le serveur. Vérifiez votre connexion.",
    );
  });

  it.each([Status.CALLED, Status.CANCELLED])(
    "stops timers and closes the stream after %s",
    async (status) => {
      jest.useFakeTimers();
      const { result } = await mountWaitingTicket();

      await act(async () => MockEventSource.instances[0].emit("message", JSON.stringify({ ...waitingTicket, status, position: 0, estimatedWaitMinutes: 0 })));
      expect(result.current.ticket?.status).toBe(status);
      expect(MockEventSource.instances[0].closed).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(40_000);
        await Promise.resolve();
      });
      expect(findTicket).toHaveBeenCalledTimes(1);
    },
  );

  it("does not make more requests after unmount", async () => {
    jest.useFakeTimers();
    const { unmount } = await mountWaitingTicket();
    await unmount();

    await act(async () => {
      jest.advanceTimersByTime(40_000);
      await Promise.resolve();
    });
    expect(findTicket).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances[0].closed).toBe(true);
  });

  it("marks a missing ticket and stops without retrying", async () => {
    jest.useFakeTimers();
    findTicket.mockRejectedValue(new ResponseError({ status: 404 } as Response));
    const { result } = await renderHook(() => useTicketStream(waitingTicket.id));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.error).toMatch("introuvable");
    await act(async () => {
      jest.advanceTimersByTime(40_000);
      await Promise.resolve();
    });
    expect(findTicket).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
