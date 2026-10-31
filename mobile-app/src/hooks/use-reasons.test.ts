import { act, renderHook, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { ReasonCode } from "@/api/generated";
import { reasonsApi } from "@/config";
import { useReasons } from "./use-reasons";

jest.mock("@/config", () => ({
  API_BASE_URL: "http://localhost:7000",
  reasonsApi: { reasonsControllerFindAll: jest.fn() },
  ticketsApi: {},
}));

const findReasons = jest.mocked(reasonsApi.reasonsControllerFindAll);
const reasons = [{ code: ReasonCode.AUTRE, label: "Autre" }];

describe("useReasons", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("loads reasons and ends the loading state", async () => {
    let resolveReasons!: (value: typeof reasons) => void;
    findReasons.mockReturnValue(new Promise((resolve) => { resolveReasons = resolve; }));
    const { result } = await renderHook(() => useReasons());

    expect(result.current.isLoading).toBe(true);
    await act(async () => resolveReasons(reasons));
    await waitFor(() => expect(result.current.reasons).toEqual(reasons));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("shows an error then retries successfully", async () => {
    findReasons
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(reasons);
    const { result } = await renderHook(() => useReasons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(
      "Impossible de joindre le serveur. Vérifiez votre connexion.",
    );

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.reasons).toEqual(reasons));
    expect(result.current.error).toBeNull();
  });
});
