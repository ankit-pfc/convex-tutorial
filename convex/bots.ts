import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const setData = mutation({
    args: {
        key: v.string(),
        value: v.any(),
        agentId: v.optional(v.string()),
    },
    handler: async (ctx: MutationCtx, args) => {
        // Check if key exists
        const existing = await ctx.db
            .query("bot_data")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                agentId: args.agentId,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("bot_data", {
            key: args.key,
            value: args.value,
            agentId: args.agentId,
            updatedAt: Date.now(),
        });
    },
});

export const getData = query({
    args: { key: v.string() },
    handler: async (ctx: QueryCtx, args) => {
        const data = await ctx.db
            .query("bot_data")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();
        return data?.value;
    },
});

export const storeChat = mutation({
    args: {
        agentId: v.string(),
        sessionId: v.string(),
        messages: v.array(
            v.object({
                role: v.string(),
                content: v.string(),
                timestamp: v.number(),
            })
        ),
    },
    handler: async (ctx: MutationCtx, args) => {
        const key = `chat:${args.agentId}:${args.sessionId}`;
        return await ctx.db.insert("bot_data", {
            key,
            value: args.messages,
            agentId: args.agentId,
            updatedAt: Date.now(),
        });
    },
});

export const getChats = query({
    args: { agentId: v.string(), sessionId: v.optional(v.string()) },
    handler: async (ctx: QueryCtx, args) => {
        const prefix = args.sessionId
            ? `chat:${args.agentId}:${args.sessionId}`
            : `chat:${args.agentId}:`;

        const allData = await ctx.db.query("bot_data").collect();
        return allData.filter((d) => d.key.startsWith(prefix));
    },
});

export const botMessage = mutation({
    args: {
        fromAgent: v.string(),
        toAgent: v.string(),
        content: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        const now = Date.now();

        // Store inter-agent message
        const messageKey = `interagent:${args.fromAgent}:${args.toAgent}:${now}`;
        await ctx.db.insert("bot_data", {
            key: messageKey,
            value: { content: args.content, timestamp: now },
            agentId: args.fromAgent,
            updatedAt: now,
        });

        // Create notification for recipient
        await ctx.db.insert("notifications", {
            mentionedAgent: args.toAgent,
            sourceType: "interagent",
            sourceId: messageKey,
            content: `Message from ${args.fromAgent}: ${args.content.slice(0, 100)}...`,
            delivered: false,
            createdAt: now,
        });

        return messageKey;
    },
});
