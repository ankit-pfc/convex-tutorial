import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        mentionedAgent: v.string(),
        sourceType: v.string(),
        sourceId: v.string(),
        content: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        return await ctx.db.insert("notifications", {
            mentionedAgent: args.mentionedAgent,
            sourceType: args.sourceType,
            sourceId: args.sourceId,
            content: args.content,
            delivered: false,
            createdAt: Date.now(),
        });
    },
});

export const getUndelivered = query({
    args: { agentId: v.optional(v.string()) },
    handler: async (ctx: QueryCtx, args) => {
        if (args.agentId) {
            return await ctx.db
                .query("notifications")
                .withIndex("by_undelivered", (q) => q.eq("delivered", false).eq("mentionedAgent", args.agentId!))
                .collect();
        }
        return await ctx.db
            .query("notifications")
            .filter((q) => q.eq(q.field("delivered"), false))
            .collect();
    },
});

export const markDelivered = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx: MutationCtx, args) => {
        await ctx.db.patch(args.id, { delivered: true });
        return args.id;
    },
});

export const getForAgent = query({
    args: { agentId: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx: QueryCtx, args) => {
        const limit = args.limit || 50;
        return await ctx.db
            .query("notifications")
            .withIndex("by_agent", (q) => q.eq("mentionedAgent", args.agentId))
            .order("desc")
            .take(limit);
    },
});
