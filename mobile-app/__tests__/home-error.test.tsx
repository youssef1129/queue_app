import { fireEvent, render, screen } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { reasonsApi } from "@/config";
import HomeScreen from "@/app/index";

jest.mock("@/config", () => ({
  API_BASE_URL: "http://localhost:7000",
  reasonsApi: { reasonsControllerFindAll: jest.fn() },
  ticketsApi: { ticketsControllerCreate: jest.fn() },
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }));
jest.mock("@/constants/theme", () => ({
  HealthcareTheme: {
    colors: {
      background: "white", surface: "white", text: "black", muted: "gray", border: "gray",
      primary: "blue", primaryPressed: "blue", selected: "white", selectedBorder: "blue",
      danger: "red", warningBackground: "yellow", warningText: "black",
      successBackground: "green", successText: "white",
    },
    spacing: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
    radius: { sm: 2, md: 3, lg: 4, pill: 5 },
  },
}));
jest.mock("@/hooks/useRestoreTicket", () => ({ useRestoreTicket: () => ({ isRestoring: false }) }));
jest.mock("@/storage/storage", () => ({ saveTicketId: jest.fn(), clearTicketId: jest.fn() }));
jest.mock("@/notifications/notifications", () => ({ requestNotificationPermission: jest.fn() }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

const findReasons = jest.mocked(reasonsApi.reasonsControllerFindAll);

describe("home API error", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("shows the server error and retry button instead of the skeleton", async () => {
    findReasons
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce([]);
    await render(<HomeScreen />);

    expect(screen.getByText(/Impossible de joindre le serveur/)).toBeTruthy();
    const retryButton = screen.getByRole("button", { name: /essayer/ });
    expect(retryButton).toBeTruthy();
    await fireEvent.press(retryButton);
    expect(findReasons).toHaveBeenCalledTimes(2);
  });
});
