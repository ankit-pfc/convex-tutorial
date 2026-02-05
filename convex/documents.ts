import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        type: v.string(),
        authorId: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        const now = Date.now();
        const docId = await ctx.db.insert("documents", {
            title: args.title,
            content: args.content,
            type: args.type,
            authorId: args.authorId,
            createdAt: now,
        });

        // Log activity
        await ctx.db.insert("activity_feed", {
            agentId: args.authorId,
            action: "created",
            targetType: "document",
            targetId: docId,
            summary: `${args.authorId} created document: ${args.title}`,
            createdAt: now,
        });

        return docId;
    },
});

export const get = query({
    args: { id: v.id("documents") },
    handler: async (ctx: QueryCtx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const list = query({
    args: { type: v.optional(v.string()) },
    handler: async (ctx: QueryCtx, args) => {
        if (args.type) {
            return await ctx.db
                .query("documents")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("documents").order("desc").collect();
    },
});

export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        type: v.optional(v.string()),
    },
    handler: async (ctx: MutationCtx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return id;
    },
});
