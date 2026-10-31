import { FetchError, ResponseError } from "@/api/generated";

export type ApiErrorContext = "reasons" | "join" | "ticket" | "cancel";

export function getApiErrorStatus(error: unknown): number | undefined {
  return error instanceof ResponseError ? error.response.status : undefined;
}

export function getApiErrorMessage(
  error: unknown,
  context: ApiErrorContext,
): string {
  const status = getApiErrorStatus(error);

  if (isNetworkFailure(error)) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  }

  if (status === 400 && context === "join") {
    return "Ce motif ne peut pas être utilisé pour le moment. Choisissez un autre motif.";
  }
  if (status === 404 && context === "ticket") {
    return "Ce ticket est introuvable. Vous pouvez revenir au choix du motif.";
  }
  if (status === 409 && context === "cancel") {
    return "La file a déjà évolué. Nous vérifions votre statut.";
  }
  if (status === 409) {
    return "Votre demande a déjà changé. Réessayez dans un instant.";
  }
  if (status !== undefined && status >= 500) {
    return "Le service est momentanément indisponible. Réessayez dans un instant.";
  }
  if (status === 404) {
    return "Les informations demandées ne sont plus disponibles.";
  }
  if (status === 400) {
    return "La demande n’a pas pu être comprise. Vérifiez les informations puis réessayez.";
  }
  return "Une erreur est survenue. Réessayez dans un instant.";
}

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError || error instanceof FetchError;
}
