import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import RequireAuth from "../RequireAuth";

const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RequireAuth", () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows a loading message while auth is resolving", () => {
    mockUseAuth.mockReturnValue({ isAuthReady: false, user: null });

    render(
      <MemoryRouter>
        <RequireAuth />
      </MemoryRouter>
    );

    expect(screen.getByText("Checking your session")).toBeInTheDocument();
  });

  it("prompts the user to log in when unauthenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthReady: true, user: null });

    render(
      <MemoryRouter>
        <RequireAuth />
      </MemoryRouter>
    );

    expect(screen.getByText("Login required")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
  });
});