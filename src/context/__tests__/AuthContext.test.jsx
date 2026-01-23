import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";

const TestConsumer = () => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <div>loading</div>;
  }

  return <div>{user ? `user:${user.username}` : "guest"}</div>;
};

const buildToken = ({ exp, username = "sam", id = "u-1" }) => {
  const payload = {
    exp,
    username,
    id,
  };
  const encoded = window
    .btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
};

describe("AuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("hydrates user data from a valid stored token", async () => {
    const token = buildToken({
      exp: Math.floor(Date.now() / 1000) + 60,
      username: "taylor",
    });
    window.localStorage.setItem("disasterbot_access_token", token);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("user:taylor")).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refreshes an expired token and updates the user", async () => {
    const expired = buildToken({
      exp: Math.floor(Date.now() / 1000) - 60,
      username: "old",
    });
    const refreshed = buildToken({
      exp: Math.floor(Date.now() / 1000) + 120,
      username: "new-user",
    });
    window.localStorage.setItem("disasterbot_access_token", expired);

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: refreshed }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("user:new-user")).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:3000/auth/refresh",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });
});