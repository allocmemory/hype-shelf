import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConvexError } from "convex/values";

type MockUser = {
  _id: string;
  clerkId: string;
  role: "admin" | "user";
  name: string;
  email: string;
};

type MockRecommendation = {
  _id: string;
  userId: string;
  title: string;
  genre: string;
  link: string;
  blurb: string;
  isStaffPick: boolean;
};

const createMockCtx = () => ({
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
});

const getAuthenticatedUser = async (ctx: ReturnType<typeof createMockCtx>): Promise<MockUser> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }
  const user = await ctx.db.query("users").withIndex("by_clerkId", () => {}).unique();
  if (!user) {
    throw new ConvexError("User not found");
  }
  return user as MockUser;
};

describe("deleteRecommendation", () => {
  let mockCtx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    mockCtx = createMockCtx();
  });

  const deleteRecommendation = async (
    ctx: ReturnType<typeof createMockCtx>,
    args: { recommendationId: string }
  ) => {
    const user = await getAuthenticatedUser(ctx);

    const recommendation = (await ctx.db.get(args.recommendationId)) as MockRecommendation | null;
    if (!recommendation) {
      throw new ConvexError("Recommendation not found");
    }

    const isOwner = recommendation.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ConvexError("Not authorized to delete this recommendation");
    }

    await ctx.db.delete(args.recommendationId);
  };

  it("throws Unauthenticated when not logged in", async () => {
    mockCtx.auth.getUserIdentity.mockResolvedValue(null);

    await expect(deleteRecommendation(mockCtx, { recommendationId: "rec_1" })).rejects.toThrow(
      "Unauthenticated"
    );
  });

  it("allows user to delete their own recommendation", async () => {
    const mockUser: MockUser = {
      _id: "user_1",
      clerkId: "clerk_1",
      role: "user",
      name: "Test",
      email: "test@test.com",
    };
    const mockRec: MockRecommendation = {
      _id: "rec_1",
      userId: "user_1",
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
      isStaffPick: false,
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_1" });
    mockCtx.db.unique.mockResolvedValue(mockUser);
    mockCtx.db.get.mockResolvedValue(mockRec);

    await deleteRecommendation(mockCtx, { recommendationId: "rec_1" });

    expect(mockCtx.db.delete).toHaveBeenCalledWith("rec_1");
  });

  it("prevents user from deleting another user's recommendation", async () => {
    const mockUser: MockUser = {
      _id: "user_1",
      clerkId: "clerk_1",
      role: "user",
      name: "Test",
      email: "test@test.com",
    };
    const mockRec: MockRecommendation = {
      _id: "rec_1",
      userId: "user_2",
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
      isStaffPick: false,
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_1" });
    mockCtx.db.unique.mockResolvedValue(mockUser);
    mockCtx.db.get.mockResolvedValue(mockRec);

    await expect(deleteRecommendation(mockCtx, { recommendationId: "rec_1" })).rejects.toThrow(
      "Not authorized to delete this recommendation"
    );
  });

  it("allows admin to delete any recommendation", async () => {
    const mockAdmin: MockUser = {
      _id: "admin_1",
      clerkId: "clerk_admin",
      role: "admin",
      name: "Admin",
      email: "admin@test.com",
    };
    const mockRec: MockRecommendation = {
      _id: "rec_1",
      userId: "user_2",
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
      isStaffPick: false,
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_admin" });
    mockCtx.db.unique.mockResolvedValue(mockAdmin);
    mockCtx.db.get.mockResolvedValue(mockRec);

    await deleteRecommendation(mockCtx, { recommendationId: "rec_1" });

    expect(mockCtx.db.delete).toHaveBeenCalledWith("rec_1");
  });
});

describe("setStaffPick", () => {
  let mockCtx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    mockCtx = createMockCtx();
  });

  const setStaffPick = async (
    ctx: ReturnType<typeof createMockCtx>,
    args: { recommendationId: string; isStaffPick: boolean }
  ) => {
    const user = await getAuthenticatedUser(ctx);

    if (user.role !== "admin") {
      throw new ConvexError("Admin access required");
    }

    const recommendation = (await ctx.db.get(args.recommendationId)) as MockRecommendation | null;
    if (!recommendation) {
      throw new ConvexError("Recommendation not found");
    }

    if (args.isStaffPick) {
      const currentStaffPick = (await ctx.db
        .query("recommendations")
        .withIndex("by_isStaffPick", () => {})
        .unique()) as MockRecommendation | null;

      if (currentStaffPick && currentStaffPick._id !== args.recommendationId) {
        await ctx.db.patch(currentStaffPick._id, { isStaffPick: false });
      }
    }

    await ctx.db.patch(args.recommendationId, { isStaffPick: args.isStaffPick });
  };

  it("prevents non-admin from setting staff pick", async () => {
    const mockUser: MockUser = {
      _id: "user_1",
      clerkId: "clerk_1",
      role: "user",
      name: "Test",
      email: "test@test.com",
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_1" });
    mockCtx.db.unique.mockResolvedValue(mockUser);

    await expect(
      setStaffPick(mockCtx, { recommendationId: "rec_1", isStaffPick: true })
    ).rejects.toThrow("Admin access required");
  });

  it("allows admin to set staff pick", async () => {
    const mockAdmin: MockUser = {
      _id: "admin_1",
      clerkId: "clerk_admin",
      role: "admin",
      name: "Admin",
      email: "admin@test.com",
    };
    const mockRec: MockRecommendation = {
      _id: "rec_1",
      userId: "user_2",
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
      isStaffPick: false,
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_admin" });
    let uniqueCallCount = 0;
    mockCtx.db.unique.mockImplementation(() => {
      uniqueCallCount++;
      if (uniqueCallCount === 1) return Promise.resolve(mockAdmin);
      return Promise.resolve(null);
    });
    mockCtx.db.get.mockResolvedValue(mockRec);

    await setStaffPick(mockCtx, { recommendationId: "rec_1", isStaffPick: true });

    expect(mockCtx.db.patch).toHaveBeenCalledWith("rec_1", { isStaffPick: true });
  });

  it("unsets previous staff pick when setting a new one", async () => {
    const mockAdmin: MockUser = {
      _id: "admin_1",
      clerkId: "clerk_admin",
      role: "admin",
      name: "Admin",
      email: "admin@test.com",
    };
    const mockRec: MockRecommendation = {
      _id: "rec_1",
      userId: "user_2",
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
      isStaffPick: false,
    };
    const existingStaffPick: MockRecommendation = {
      _id: "rec_2",
      userId: "user_3",
      title: "Old Pick",
      genre: "comedy",
      link: "https://old.com",
      blurb: "Old blurb",
      isStaffPick: true,
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_admin" });
    let uniqueCallCount = 0;
    mockCtx.db.unique.mockImplementation(() => {
      uniqueCallCount++;
      if (uniqueCallCount === 1) return Promise.resolve(mockAdmin);
      return Promise.resolve(existingStaffPick);
    });
    mockCtx.db.get.mockResolvedValue(mockRec);

    await setStaffPick(mockCtx, { recommendationId: "rec_1", isStaffPick: true });

    expect(mockCtx.db.patch).toHaveBeenCalledWith("rec_2", { isStaffPick: false });
    expect(mockCtx.db.patch).toHaveBeenCalledWith("rec_1", { isStaffPick: true });
  });
});

describe("addRecommendation", () => {
  let mockCtx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    mockCtx = createMockCtx();
  });

  const addRecommendation = async (
    ctx: ReturnType<typeof createMockCtx>,
    args: { title: string; genre: string; link: string; blurb: string }
  ) => {
    const user = await getAuthenticatedUser(ctx);

    const recId = await ctx.db.insert("recommendations", {
      userId: user._id,
      title: args.title,
      genre: args.genre,
      link: args.link,
      blurb: args.blurb,
      isStaffPick: false,
    });

    return recId;
  };

  it("throws Unauthenticated when not logged in", async () => {
    mockCtx.auth.getUserIdentity.mockResolvedValue(null);

    await expect(
      addRecommendation(mockCtx, {
        title: "Test",
        genre: "action",
        link: "https://test.com",
        blurb: "Test blurb",
      })
    ).rejects.toThrow("Unauthenticated");
  });

  it("creates recommendation with correct userId", async () => {
    const mockUser: MockUser = {
      _id: "user_1",
      clerkId: "clerk_1",
      role: "user",
      name: "Test",
      email: "test@test.com",
    };

    mockCtx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_1" });
    mockCtx.db.unique.mockResolvedValue(mockUser);
    mockCtx.db.insert.mockResolvedValue("rec_new");

    await addRecommendation(mockCtx, {
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
    });

    expect(mockCtx.db.insert).toHaveBeenCalledWith("recommendations", {
      userId: "user_1",
      title: "Test",
      genre: "action",
      link: "https://test.com",
      blurb: "Test blurb",
      isStaffPick: false,
    });
  });
});
