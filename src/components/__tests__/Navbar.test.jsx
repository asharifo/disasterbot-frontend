import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import NavBar from "../NavBar";

const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("NavBar", () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows login and register actions when unauthenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthReady: true,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  it("greets the user and shows a logout button when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { username: "User" },
      isAuthReady: true,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getByText("Hi, User")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log out" })
    ).toBeInTheDocument();
  });
});