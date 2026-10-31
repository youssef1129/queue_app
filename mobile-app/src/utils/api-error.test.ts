import { describe, expect, it } from "@jest/globals";
import { FetchError, ResponseError } from "@/api/generated";
import { getApiErrorMessage, getApiErrorStatus } from "./api-error";

describe("API errors", () => {
  it("gives a French message for a network failure", () => {
    expect(getApiErrorMessage(new TypeError("Failed to fetch"), "reasons")).toBe(
      "Impossible de joindre le serveur. Vérifiez votre connexion.",
    );
  });

  it("treats an aborted request as a timeout", () => {
    const timeout = new Error("Request timed out");
    timeout.name = "TimeoutError";
    expect(getApiErrorMessage(new FetchError(timeout), "ticket")).toBe(
      "Impossible de joindre le serveur. Vérifiez votre connexion.",
    );
  });

  it.each([
    [404, "ticket", "Ce ticket est introuvable. Vous pouvez revenir au choix du motif."],
    [409, "cancel", "La file a déjà évolué. Nous vérifions votre statut."],
    [400, "join", "Ce motif ne peut pas être utilisé pour le moment. Choisissez un autre motif."],
  ] as const)("maps HTTP %i to a French message", (status, context, message) => {
    const error = new ResponseError({ status } as Response);
    expect(getApiErrorStatus(error)).toBe(status);
    expect(getApiErrorMessage(error, context)).toBe(message);
  });

  it("uses the generic message for an unknown error", () => {
    const error = new Error("unknown");
    expect(getApiErrorStatus(error)).toBeUndefined();
    expect(getApiErrorMessage(error, "reasons")).toBe(
      "Une erreur est survenue. Réessayez dans un instant.",
    );
  });

  it("shows a service unavailable message for server errors", () => {
    const error = new ResponseError({ status: 503 } as Response);
    expect(getApiErrorMessage(error, "reasons")).toBe(
      "Le service est momentanément indisponible. Réessayez dans un instant.",
    );
  });
});
