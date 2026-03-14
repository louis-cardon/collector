import { getAccessToken } from "@/lib/auth/token-storage";
import { apiRequest, apiRequestWithAuth } from "./client";

jest.mock("@/lib/auth/token-storage", () => ({
  getAccessToken: jest.fn(),
}));

const getAccessTokenMock = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;

function mockJsonResponse<T>(status: number, body: T): {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
} {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe("api client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    getAccessTokenMock.mockReturnValue(null);
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "test";
  });

  it("calls proxy path and adds default Accept header", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(200, { items: [] }),
    );

    await apiRequest<{ items: unknown[] }>("/catalog");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/catalog",
      expect.objectContaining({
        cache: "no-store",
      }),
    );

    const requestInit = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit;
    const headers = requestInit.headers as Headers;

    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Authorization")).toBeNull();
  });

  it("adds Content-Type for requests with JSON body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(200, { ok: true }),
    );

    await apiRequest<{ ok: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@collector.local", password: "secret" }),
    });

    const requestInit = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit;
    const headers = requestInit.headers as Headers;

    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("adds Authorization header only for authenticated requests", async () => {
    getAccessTokenMock.mockReturnValue("jwt-token");
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(200, { id: "article-1" }),
    );

    await apiRequestWithAuth<{ id: string }>("articles");

    const requestInit = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit;
    const headers = requestInit.headers as Headers;

    expect((global.fetch as jest.Mock).mock.calls[0]?.[0]).toBe("/api/articles");
    expect(headers.get("Authorization")).toBe("Bearer jwt-token");
  });

  it("throws ApiError with backend message when request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(400, { message: ["title must not be empty"] }),
    );

    await expect(apiRequest("/articles")).rejects.toMatchObject({
      name: "ApiError",
      message: "title must not be empty",
      status: 400,
    });
  });

  it("uses the configured API base URL in production deployments", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL =
      "https://collector-api-f9xu.onrender.com/";
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(200, { items: [] }),
    );

    await apiRequest<{ items: unknown[] }>("/catalog");

    expect((global.fetch as jest.Mock).mock.calls[0]?.[0]).toBe(
      "https://collector-api-f9xu.onrender.com/catalog",
    );
  });

  it("falls back to the deployed backend origin outside development", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(200, { items: [] }),
    );

    await apiRequest<{ items: unknown[] }>("/catalog");

    expect((global.fetch as jest.Mock).mock.calls[0]?.[0]).toBe(
      "https://collector-api-f9xu.onrender.com/catalog",
    );
  });
});
