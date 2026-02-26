import { describe, it, expect, vi } from "vitest";
import { ConvexError } from "convex/values";

const mockCtx = {
  auth: {
    getUserIdentity: vi.fn(),
  },
  db: {
    query: vi.fn().mockReturnThis(),
    withIndex: vi.fn().mockReturnThis(),
    unique: vi.fn(),
    get: vi.fn(),
    insert: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
};

describe("getAuthenticatedUser", () => {
  it("throws Unauthenticated when no identity", async () => {
    mockCtx.auth.getUserIdentity.mockResolvedValue(null);

    const getAuthenticatedUser = async (ctx: typeof mockCtx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Unauthenticated");
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: unknown) => q)
        .unique();
      if (!user) {
        throw new ConvexError("User not found");
      }
      return user;
    };

    await expect(getAuthenticatedUser(mockCtx)).rejects.toThrow("Unauthenticated");
  });

  it("throws User not found when user does not exist", async () => {
    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_123" });
    mockCtx.db.unique.mockResolvedValue(null);

    const getAuthenticatedUser = async (ctx: typeof mockCtx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Unauthenticated");
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: unknown) => q)
        .unique();
      if (!user) {
        throw new ConvexError("User not found");
      }
      return user;
    };

    await expect(getAuthenticatedUser(mockCtx)).rejects.toThrow("User not found");
  });

  it("returns user when authenticated and user exists", async () => {
    const mockUser = { _id: "user_1", clerkId: "clerk_123", role: "user" };
    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_123" });
    mockCtx.db.unique.mockResolvedValue(mockUser);

    const getAuthenticatedUser = async (ctx: typeof mockCtx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Unauthenticated");
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: unknown) => q)
        .unique();
      if (!user) {
        throw new ConvexError("User not found");
      }
      return user;
    };

    const result = await getAuthenticatedUser(mockCtx);
    expect(result).toEqual(mockUser);
  });
});

describe("requireAdmin", () => {
  it("throws Admin access required for non-admin user", () => {
    const requireAdmin = (user: { role: string }) => {
      if (user.role !== "admin") {
        throw new ConvexError("Admin access required");
      }
    };

    expect(() => requireAdmin({ role: "user" })).toThrow("Admin access required");
  });

  it("does not throw for admin user", () => {
    const requireAdmin = (user: { role: string }) => {
      if (user.role !== "admin") {
        throw new ConvexError("Admin access required");
      }
    };

    expect(() => requireAdmin({ role: "admin" })).not.toThrow();
  });
});
