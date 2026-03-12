import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { clearAuthSession, getAuthUser } from "@/lib/auth/token-storage";
import DemoNavigation from "./demo-navigation";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/auth/token-storage", () => ({
  clearAuthSession: jest.fn(),
  getAuthUser: jest.fn(),
}));

const clearAuthSessionMock = clearAuthSession as jest.MockedFunction<
  typeof clearAuthSession
>;
const getAuthUserMock = getAuthUser as jest.MockedFunction<typeof getAuthUser>;

describe("DemoNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows disconnected state when no user is stored", async () => {
    getAuthUserMock.mockReturnValue(null);

    render(<DemoNavigation />);

    expect(await screen.findByText("Non connecte")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Se deconnecter" }),
    ).not.toBeInTheDocument();
  });

  it("logs out and redirects to home when user clicks logout", async () => {
    getAuthUserMock.mockReturnValue({
      id: "admin-id",
      email: "admin@collector.local",
      role: "admin",
    });

    render(<DemoNavigation />);

    const logoutButton = await screen.findByRole("button", {
      name: "Se deconnecter",
    });

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(clearAuthSessionMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });
  });
});
