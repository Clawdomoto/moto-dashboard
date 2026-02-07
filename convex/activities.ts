import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const add = mutation({
  args: {
    timestamp: v.number(),
    actionType: v.string(),
    description: v.string(),
    status: v.string(),
    tokensUsed: v.optional(v.number()),
    source: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});

export const addBatch = mutation({
  args: {
    activities: v.array(v.object({
      timestamp: v.number(),
      actionType: v.string(),
      description: v.string(),
      status: v.string(),
      tokensUsed: v.optional(v.number()),
      source: v.string(),
      metadata: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    for (const activity of args.activities) {
      await ctx.db.insert("activities", activity);
    }
  },
});

export const clear = mutation({
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }
  },
});
