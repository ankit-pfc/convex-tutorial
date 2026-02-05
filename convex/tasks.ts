import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Agent roster for validation
const AGENTS = ["goku", "gohan", "krilin", "picollo", "vegita", "trunks", "bulma", "tien", "chichi"] as const;

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        assignees: v.optional(v.array(v.string())),
    },
    handler: async (ctx: MutationCtx, args) => {
        const now = Date.now();
        const taskId = await ctx.db.insert("tasks", {
            title: args.title,
            description: args.description,
            status: args.assignees?.length ? "assigned" : "inbox",
            assignees: args.assignees || [],
            createdAt: now,
            updatedAt: now,
        });

        // Auto-subscribe assignees
        if (args.assignees) {
            for (const agentId of args.assignees) {
                await ctx.db.insert("subscriptions", { agentId, taskId });
            }
        }

        // Log activity
        await ctx.db.insert("activity_feed", {
            agentId: "system",
            action: "created",
            targetType: "task",
            targetId: taskId,
            summary: `Task created: ${args.title}`,
            createdAt: now,
        });

        return taskId;
    },
});

export const update = mutation({
    args: {
        id: v.id("tasks"),
        status: v.optional(
            v.union(
                v.literal("inbox"),
                v.literal("assigned"),
                v.literal("in_progress"),
                v.literal("review"),
                v.literal("done"),
                v.literal("blocked")
            )
        ),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        assignees: v.optional(v.array(v.string())),
    },
    handler: async (ctx: MutationCtx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Task not found");

        const now = Date.now();
        await ctx.db.patch(id, { ...updates, updatedAt: now });

        // Log activity
        if (args.status) {
            await ctx.db.insert("activity_feed", {
                agentId: "system",
                action: `status_${args.status}`,
                targetType: "task",
                targetId: id,
                summary: `Task status changed to ${args.status}: ${existing.title}`,
                createdAt: now,
            });
        }

        return id;
    },
});

export const assign = mutation({
    args: {
        id: v.id("tasks"),
        assignees: v.array(v.string()),
    },
    handler: async (ctx: MutationCtx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const now = Date.now();
        await ctx.db.patch(args.id, {
            assignees: args.assignees,
            status: args.assignees.length ? "assigned" : task.status,
            updatedAt: now,
        });

        // Auto-subscribe new assignees
        for (const agentId of args.assignees) {
            const existing = await ctx.db
                .query("subscriptions")
                .withIndex("by_task", (q) => q.eq("taskId", args.id))
                .filter((q) => q.eq(q.field("agentId"), agentId))
                .first();
            if (!existing) {
                await ctx.db.insert("subscriptions", { agentId, taskId: args.id });
            }
        }

        // Notify assignees
        for (const agentId of args.assignees) {
            await ctx.db.insert("notifications", {
                mentionedAgent: agentId,
                sourceType: "task",
                sourceId: args.id,
                content: `You've been assigned to: ${task.title}`,
                delivered: false,
                createdAt: now,
            });
        }

        return args.id;
    },
});

export const get = query({
    args: { id: v.id("tasks") },
    handler: async (ctx: QueryCtx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const list = query({
    args: {
        status: v.optional(
            v.union(
                v.literal("inbox"),
                v.literal("assigned"),
                v.literal("in_progress"),
                v.literal("review"),
                v.literal("done"),
                v.literal("blocked")
            )
        ),
        assignee: v.optional(v.string()),
    },
    handler: async (ctx: QueryCtx, args) => {
        let tasks;

        if (args.status) {
            tasks = await ctx.db
                .query("tasks")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        } else {
            tasks = await ctx.db.query("tasks").collect();
        }

        if (args.assignee) {
            return tasks.filter((t) => t.assignees.includes(args.assignee!));
        }

        return tasks;
    },
});
