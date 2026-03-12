import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  saveAuthSession,
} from "./token-storage";

describe("token-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and reads auth session", () => {
    saveAuthSession("jwt-token", {
      id: "seller-id",
      email: "seller@collector.local",
      role: "seller",
    });

    expect(getAccessToken()).toBe("jwt-token");
    expect(getAuthUser()).toEqual({
      id: "seller-id",
      email: "seller@collector.local",
      role: "seller",
    });
  });

  it("returns null when no auth user is stored", () => {
    expect(getAuthUser()).toBeNull();
  });

  it("returns null and clears corrupted auth user payload", () => {
    window.localStorage.setItem("collector_auth_user", "{invalid-json");

    expect(getAuthUser()).toBeNull();
    expect(window.localStorage.getItem("collector_auth_user")).toBeNull();
  });

  it("clears auth session", () => {
    saveAuthSession("jwt-token", {
      id: "admin-id",
      email: "admin@collector.local",
      role: "admin",
    });

    clearAuthSession();

    expect(getAccessToken()).toBeNull();
    expect(getAuthUser()).toBeNull();
  });
});
