import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchQuery = args.query.toLowerCase();
    
    const allDocs = await ctx.db.query("searchIndex").collect();
    
    const results = allDocs
      .filter((doc) => doc.content.toLowerCase().includes(searchQuery))
      .map((doc) => {
        const content = doc.content;
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(searchQuery);
        
        // Extract context around match
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + searchQuery.length + 100);
        const snippet = (start > 0 ? "..." : "") + 
          content.slice(start, end) + 
          (end < content.length ? "..." : "");
        
        return {
          ...doc,
          snippet,
          matchIndex: index,
        };
      })
      .slice(0, limit);
    
    return results;
  },
});

export const indexFile = mutation({
  args: {
    filePath: v.string(),
    fileName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("searchIndex")
      .withIndex("by_path", (q) => q.eq("filePath", args.filePath))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        lastIndexed: Date.now(),
      });
      return existing._id;
    }
    
    return await ctx.db.insert("searchIndex", {
      ...args,
      lastIndexed: Date.now(),
    });
  },
});

export const clearIndex = mutation({
  handler: async (ctx) => {
    const docs = await ctx.db.query("searchIndex").collect();
    for (const doc of docs) {
      await ctx.db.delete(doc._id);
    }
  },
});
