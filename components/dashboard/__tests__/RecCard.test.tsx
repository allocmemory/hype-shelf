import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecCard } from "../RecCard";
import type { RecommendationWithUser, CurrentUser } from "@/types";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    recommendations: {
      deleteRecommendation: "deleteRecommendation",
      setStaffPick: "setStaffPick",
    },
  },
}));

const createMockRecommendation = (
  overrides: Partial<RecommendationWithUser> = {}
): RecommendationWithUser => ({
  _id: "rec_1" as RecommendationWithUser["_id"],
  _creationTime: Date.now(),
  userId: "user_1" as RecommendationWithUser["userId"],
  title: "Test Recommendation",
  genre: "action",
  link: "https://example.com",
  blurb: "This is a test blurb",
  isStaffPick: false,
  user: {
    _id: "user_1" as RecommendationWithUser["user"]["_id"],
    name: "Test User",
  },
  ...overrides,
});

const createMockUser = (overrides: Partial<NonNullable<CurrentUser>> = {}): CurrentUser => ({
  _id: "user_1" as NonNullable<CurrentUser>["_id"],
  clerkId: "clerk_1",
  email: "test@test.com",
  name: "Test User",
  role: "user",
  ...overrides,
});

describe("RecCard", () => {
  it("renders title, genre, and blurb", () => {
    const rec = createMockRecommendation();
    const user = createMockUser();

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByText("Test Recommendation")).toBeInTheDocument();
    expect(screen.getByText("action")).toBeInTheDocument();
    expect(screen.getByText("This is a test blurb")).toBeInTheDocument();
  });

  it("renders user name", () => {
    const rec = createMockRecommendation();
    const user = createMockUser();

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByText("by Test User")).toBeInTheDocument();
  });

  it("renders link with noopener noreferrer", () => {
    const rec = createMockRecommendation();
    const user = createMockUser();

    render(<RecCard recommendation={rec} currentUser={user} />);

    const link = screen.getByRole("link", { name: "View link" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows Staff Pick badge when isStaffPick is true", () => {
    const rec = createMockRecommendation({ isStaffPick: true });
    const user = createMockUser();

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByText("Staff Pick")).toBeInTheDocument();
  });

  it("does not show Staff Pick badge when isStaffPick is false", () => {
    const rec = createMockRecommendation({ isStaffPick: false });
    const user = createMockUser();

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.queryByText("Staff Pick")).not.toBeInTheDocument();
  });

  it("shows delete button for owner", () => {
    const rec = createMockRecommendation({
      userId: "user_1" as RecommendationWithUser["userId"],
    });
    const user = createMockUser({
      _id: "user_1" as NonNullable<CurrentUser>["_id"],
    });

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("shows delete button for admin (not owner)", () => {
    const rec = createMockRecommendation({
      userId: "user_2" as RecommendationWithUser["userId"],
    });
    const user = createMockUser({
      _id: "admin_1" as NonNullable<CurrentUser>["_id"],
      role: "admin",
    });

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does not show delete button for non-owner regular user", () => {
    const rec = createMockRecommendation({
      userId: "user_2" as RecommendationWithUser["userId"],
    });
    const user = createMockUser({
      _id: "user_1" as NonNullable<CurrentUser>["_id"],
      role: "user",
    });

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("shows Staff Pick toggle button for admin", () => {
    const rec = createMockRecommendation();
    const user = createMockUser({ role: "admin" });

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByRole("button", { name: "Staff Pick" })).toBeInTheDocument();
  });

  it("shows Remove Pick button for admin when already staff pick", () => {
    const rec = createMockRecommendation({ isStaffPick: true });
    const user = createMockUser({ role: "admin" });

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.getByRole("button", { name: "Remove Pick" })).toBeInTheDocument();
  });

  it("does not show Staff Pick toggle button for regular user", () => {
    const rec = createMockRecommendation();
    const user = createMockUser({ role: "user" });

    render(<RecCard recommendation={rec} currentUser={user} />);

    expect(screen.queryByRole("button", { name: "Staff Pick" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove Pick" })).not.toBeInTheDocument();
  });
});
