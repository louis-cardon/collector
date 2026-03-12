import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveAuthSession } from "@/lib/auth/token-storage";
import LoginPage from "./page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/lib/api/auth", () => ({
  login: jest.fn(),
}));

jest.mock("@/lib/auth/token-storage", () => ({
  saveAuthSession: jest.fn(),
}));

const loginMock = login as jest.MockedFunction<typeof login>;
const saveAuthSessionMock = saveAuthSession as jest.MockedFunction<
  typeof saveAuthSession
>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in a seller and redirects to seller article creation", async () => {
    loginMock.mockResolvedValue({
      accessToken: "seller-jwt",
      user: {
        id: "seller-id",
        email: "seller@collector.local",
        role: "seller",
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "seller@collector.local" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "Seller123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "seller@collector.local",
        password: "Seller123!",
      });
      expect(saveAuthSessionMock).toHaveBeenCalledWith("seller-jwt", {
        id: "seller-id",
        email: "seller@collector.local",
        role: "seller",
      });
      expect(pushMock).toHaveBeenCalledWith("/seller/articles/new");
    });
  });

  it("logs in an admin and redirects to pending admin page", async () => {
    loginMock.mockResolvedValue({
      accessToken: "admin-jwt",
      user: {
        id: "admin-id",
        email: "admin@collector.local",
        role: "admin",
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@collector.local" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "Admin123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/admin/articles/pending");
    });
  });

  it("shows API error on invalid credentials", async () => {
    loginMock.mockRejectedValue(new ApiError("Invalid credentials", 401));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "seller@collector.local" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
