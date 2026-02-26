import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_CLERK_ID = "user_3ADyj6vIoqgfkfPmRqGQOjAtIWs";
const USER_CLERK_ID = "user_3ADykAFo2xuqsGqRFGHMJ4eTTNb";

const SEED_RECOMMENDATIONS = [
  {
    ownerType: "admin" as const,
    title: "Us",
    genre: "horror" as const,
    link: "https://www.imdb.com/title/tt6857112/",
    blurb: "Jordan Peele's terrifying doppelganger thriller that explores America's dark underbelly.",
    isStaffPick: false,
  },
  {
    ownerType: "admin" as const,
    title: "Interstellar",
    genre: "sci-fi" as const,
    link: "https://www.imdb.com/title/tt0816692/",
    blurb: "Christopher Nolan's epic space odyssey about love transcending dimensions.",
    isStaffPick: true,
  },
  {
    ownerType: "admin" as const,
    title: "The Dark Knight",
    genre: "action" as const,
    link: "https://www.imdb.com/title/tt0468569/",
    blurb: "Heath Ledger's iconic Joker performance in the definitive Batman film.",
    isStaffPick: false,
  },
  {
    ownerType: "user" as const,
    title: "Parasite",
    genre: "drama" as const,
    link: "https://www.imdb.com/title/tt6751668/",
    blurb: "Bong Joon-ho's Oscar-winning masterpiece about class warfare in South Korea.",
    isStaffPick: false,
  },
  {
    ownerType: "user" as const,
    title: "Everything Everywhere All at Once",
    genre: "comedy" as const,
    link: "https://www.imdb.com/title/tt6710474/",
    blurb: "A mind-bending multiverse adventure about a laundromat owner saving reality.",
    isStaffPick: false,
  },
];

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create or get admin user
    let adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", ADMIN_CLERK_ID))
      .unique();

    if (!adminUser) {
      const adminId = await ctx.db.insert("users", {
        clerkId: ADMIN_CLERK_ID,
        email: "admin@hypeshelf.dev",
        name: "Alex Admin",
        role: "admin",
      });
      adminUser = await ctx.db.get(adminId);
    } else if (adminUser.role !== "admin") {
      // Ensure admin has admin role
      await ctx.db.patch(adminUser._id, { role: "admin" });
      adminUser = await ctx.db.get(adminUser._id);
    }

    // Create or get regular user
    let regularUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", USER_CLERK_ID))
      .unique();

    if (!regularUser) {
      const userId = await ctx.db.insert("users", {
        clerkId: USER_CLERK_ID,
        email: "user@hypeshelf.dev",
        name: "Jordan User",
        role: "user",
      });
      regularUser = await ctx.db.get(userId);
    }

    if (!adminUser || !regularUser) {
      throw new Error("Failed to create users");
    }

    // Get existing recommendations to check for duplicates
    const existingRecs = await ctx.db.query("recommendations").collect();
    const existingTitles = new Set(existingRecs.map((r) => r.title));

    // Clear any existing staff pick first
    const currentStaffPick = await ctx.db
      .query("recommendations")
      .withIndex("by_isStaffPick", (q) => q.eq("isStaffPick", true))
      .unique();

    if (currentStaffPick) {
      await ctx.db.patch(currentStaffPick._id, { isStaffPick: false });
    }

    // Insert seed recommendations
    const results = [];
    for (const rec of SEED_RECOMMENDATIONS) {
      if (existingTitles.has(rec.title)) {
        results.push({ title: rec.title, status: "skipped (exists)" });

        // If this should be staff pick, find it and set it
        if (rec.isStaffPick) {
          const existingRec = existingRecs.find((r) => r.title === rec.title);
          if (existingRec && !existingRec.isStaffPick) {
            await ctx.db.patch(existingRec._id, { isStaffPick: true });
          }
        }
        continue;
      }

      const userId = rec.ownerType === "admin" ? adminUser._id : regularUser._id;

      await ctx.db.insert("recommendations", {
        userId,
        title: rec.title,
        genre: rec.genre,
        link: rec.link,
        blurb: rec.blurb,
        isStaffPick: rec.isStaffPick,
      });

      results.push({ title: rec.title, status: "created" });
    }

    return {
      adminUser: { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      regularUser: { id: regularUser._id, email: regularUser.email, role: regularUser.role },
      recommendations: results,
    };
  },
});
