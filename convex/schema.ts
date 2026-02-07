import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(),
    actionType: v.string(),
    description: v.string(),
    status: v.string(),
    tokensUsed: v.optional(v.number()),
    source: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_timestamp", ["timestamp"]),
  
  cronJobs: defineTable({
    jobId: v.string(),
    name: v.string(),
    schedule: v.string(),
    scheduleHuman: v.string(),
    nextRun: v.optional(v.string()),
    lastRun: v.optional(v.string()),
    status: v.string(),
    target: v.string(),
    agent: v.string(),
  }).index("by_name", ["name"]),
  
  searchIndex: defineTable({
    filePath: v.string(),
    fileName: v.string(),
    content: v.string(),
    lastIndexed: v.number(),
  }).index("by_path", ["filePath"]),
});
