import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("cronJobs").collect();
  },
});

export const upsert = mutation({
  args: {
    jobId: v.string(),
    name: v.string(),
    schedule: v.string(),
    scheduleHuman: v.string(),
    nextRun: v.optional(v.string()),
    lastRun: v.optional(v.string()),
    status: v.string(),
    target: v.string(),
    agent: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cronJobs")
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("cronJobs", args);
  },
});

export const sync = mutation({
  args: {
    jobs: v.array(v.object({
      jobId: v.string(),
      name: v.string(),
      schedule: v.string(),
      scheduleHuman: v.string(),
      nextRun: v.optional(v.string()),
      lastRun: v.optional(v.string()),
      status: v.string(),
      target: v.string(),
      agent: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing
    const existing = await ctx.db.query("cronJobs").collect();
    for (const job of existing) {
      await ctx.db.delete(job._id);
    }
    // Insert new
    for (const job of args.jobs) {
      await ctx.db.insert("cronJobs", job);
    }
  },
});
