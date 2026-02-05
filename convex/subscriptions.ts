import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
    args: {
        agentId: v.string(),
        taskId: v.id("tasks"),
    },
    handler: async (ctx: MutationCtx, args) => {
        // Check if already subscribed
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .filter((q) => q.eq(q.field("agentId"), args.agentId))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("subscriptions", {
            agentId: args.agentId,
            taskId: args.taskId,
        });
    },
});

export const unsubscribe = mutation({
    args: {
        agentId: v.string(),
        taskId: v.id("tasks"),
    },
    handler: async (ctx: MutationCtx, args) => {
        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .filter((q) => q.eq(q.field("agentId"), args.agentId))
            .first();

        if (sub) {
            await ctx.db.delete(sub._id);
            return true;
        }
        return false;
    },
});

export const getSubscribers = query({
    args: { taskId: v.id("tasks") },
    handler: async (ctx: QueryCtx, args) => {
        const subs = await ctx.db
            .query("subscriptions")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .collect();
        return subs.map((s) => s.agentId);
    },
});

export const getSubscriptions = query({
    args: { agentId: v.string() },
    handler: async (ctx: QueryCtx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
            .collect();
    },
});
