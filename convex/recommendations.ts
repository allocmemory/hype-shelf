import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser, requireAdmin } from "./auth";
import { ConvexError } from "convex/values";

const genreValidator = v.union(
  v.literal("horror"),
  v.literal("action"),
  v.literal("comedy"),
  v.literal("drama"),
  v.literal("sci-fi"),
  v.literal("other")
);

export const getPublicRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const recommendations = await ctx.db
      .query("recommendations")
      .order("desc")
      .take(10);

    const recsWithUsers = await Promise.all(
      recommendations.map(async (rec) => {
        const user = await ctx.db.get(rec.userId);
        return {
          _id: rec._id,
          _creationTime: rec._creationTime,
          title: rec.title,
          genre: rec.genre,
          link: rec.link,
          blurb: rec.blurb,
          isStaffPick: rec.isStaffPick,
          userName: user?.name ?? "Unknown",
        };
      })
    );

    return recsWithUsers;
  },
});

export const getAllRecommendations = query({
  args: {
    genre: v.optional(genreValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }

    let recommendations;
    const genreFilter = args.genre;
    if (genreFilter !== undefined) {
      recommendations = await ctx.db
        .query("recommendations")
        .withIndex("by_genre", (q) => q.eq("genre", genreFilter))
        .order("desc")
        .collect();
    } else {
      recommendations = await ctx.db
        .query("recommendations")
        .order("desc")
        .collect();
    }

    const recsWithUsers = await Promise.all(
      recommendations.map(async (rec) => {
        const user = await ctx.db.get(rec.userId);
        return {
          ...rec,
          user: {
            _id: user!._id,
            name: user?.name ?? "Unknown",
          },
        };
      })
    );

    return recsWithUsers;
  },
});

const MAX_TITLE_LENGTH = 200;
const MAX_BLURB_LENGTH = 1000;
const MAX_LINK_LENGTH = 2000;

export const addRecommendation = mutation({
  args: {
    title: v.string(),
    genre: genreValidator,
    link: v.string(),
    blurb: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (args.title.length === 0 || args.title.length > MAX_TITLE_LENGTH) {
      throw new ConvexError(`Title must be 1-${MAX_TITLE_LENGTH} characters`);
    }
    if (args.blurb.length === 0 || args.blurb.length > MAX_BLURB_LENGTH) {
      throw new ConvexError(`Blurb must be 1-${MAX_BLURB_LENGTH} characters`);
    }
    if (args.link.length === 0 || args.link.length > MAX_LINK_LENGTH) {
      throw new ConvexError(`Link must be 1-${MAX_LINK_LENGTH} characters`);
    }

    const recId = await ctx.db.insert("recommendations", {
      userId: user._id,
      title: args.title,
      genre: args.genre,
      link: args.link,
      blurb: args.blurb,
      isStaffPick: false,
    });

    return recId;
  },
});

export const deleteRecommendation = mutation({
  args: {
    recommendationId: v.id("recommendations"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const recommendation = await ctx.db.get(args.recommendationId);
    if (!recommendation) {
      throw new ConvexError("Recommendation not found");
    }

    const isOwner = recommendation.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ConvexError("Not authorized to delete this recommendation");
    }

    await ctx.db.delete(args.recommendationId);
  },
});

export const setStaffPick = mutation({
  args: {
    recommendationId: v.id("recommendations"),
    isStaffPick: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    requireAdmin(user);

    const recommendation = await ctx.db.get(args.recommendationId);
    if (!recommendation) {
      throw new ConvexError("Recommendation not found");
    }

    if (args.isStaffPick) {
      const currentStaffPick = await ctx.db
        .query("recommendations")
        .withIndex("by_isStaffPick", (q) => q.eq("isStaffPick", true))
        .unique();

      if (currentStaffPick && currentStaffPick._id !== args.recommendationId) {
        await ctx.db.patch(currentStaffPick._id, { isStaffPick: false });
      }
    }

    await ctx.db.patch(args.recommendationId, { isStaffPick: args.isStaffPick });
  },
});
