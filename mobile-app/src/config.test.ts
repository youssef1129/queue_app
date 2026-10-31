import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { reasonsApi } from "./config";

describe("API request timeout", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("aborts a request after eight seconds", async () => {
    jest.useFakeTimers();
    jest.spyOn(globalThis, "fetch").mockImplementation((_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      }),
    );

    const request = reasonsApi.reasonsControllerFindAll();
    const rejection = expect(request).rejects.toMatchObject({
      name: "FetchError",
      cause: { name: "TimeoutError" },
    });
    await jest.advanceTimersByTimeAsync(8_000);
    await rejection;
  });
});
