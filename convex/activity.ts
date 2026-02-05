import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
    args: {
        agentId: v.string(),
        action: v.string(),
        targetType: v.string(),
        targetId: v.string(),
        summary: v.optional(v.string()),
    },
    handler: async (ctx: MutationCtx, args) => {
        return await ctx.db.insert("activity_feed", {
            agentId: args.agentId,
            action: args.action,
            targetType: args.targetType,
            targetId: args.targetId,
            summary: args.summary || `${args.agentId} ${args.action} ${args.targetType}`,
            createdAt: Date.now(),
        });
    },
});

export const getFeed = query({
    args: {
        limit: v.optional(v.number()),
        agentId: v.optional(v.string()),
    },
    handler: async (ctx: QueryCtx, args) => {
        const limit = args.limit || 50;
        let feed = await ctx.db
            .query("activity_feed")
            .withIndex("by_time")
            .order("desc")
            .take(limit);

        if (args.agentId) {
            feed = feed.filter((item) => item.agentId === args.agentId);
        }

        return feed;
    },
});

export const getRecent = query({
    args: { hours: v.optional(v.number()) },
    handler: async (ctx: QueryCtx, args) => {
        const hours = args.hours || 24;
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        return await ctx.db
            .query("activity_feed")
            .withIndex("by_time")
            .filter((q) => q.gte(q.field("createdAt"), cutoff))
            .order("desc")
            .collect();
    },
});
