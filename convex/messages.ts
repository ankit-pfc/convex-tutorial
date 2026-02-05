import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Extract @mentions from content
function extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1].toLowerCase());
    }
    return mentions;
}

export const create = mutation({
    args: {
        taskId: v.id("tasks"),
        author: v.string(),
        content: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const now = Date.now();

        // Create message
        const messageId = await ctx.db.insert("task_comments", {
            taskId: args.taskId,
            author: args.author,
            content: args.content,
            createdAt: now,
        });

        // Auto-subscribe author
        const existingSub = await ctx.db
            .query("subscriptions")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .filter((q) => q.eq(q.field("agentId"), args.author))
            .first();
        if (!existingSub) {
            await ctx.db.insert("subscriptions", { agentId: args.author, taskId: args.taskId });
        }

        // Extract @mentions and create notifications
        const mentions = extractMentions(args.content);
        for (const mentionedAgent of mentions) {
            // Handle @all
            if (mentionedAgent === "all") {
                const allAgents = ["goku", "gohan", "krilin", "picollo", "vegita", "trunks", "bulma", "tien", "chichi"];
                for (const agent of allAgents) {
                    if (agent !== args.author) {
                        await ctx.db.insert("notifications", {
                            mentionedAgent: agent,
                            sourceType: "message",
                            sourceId: messageId,
                            content: `@all in "${task.title}": ${args.content.slice(0, 100)}...`,
                            delivered: false,
                            createdAt: now,
                        });
                    }
                }
            } else {
                await ctx.db.insert("notifications", {
                    mentionedAgent,
                    sourceType: "message",
                    sourceId: messageId,
                    content: `@${mentionedAgent} in "${task.title}": ${args.content.slice(0, 100)}...`,
                    delivered: false,
                    createdAt: now,
                });

                // Auto-subscribe mentioned agent
                const mentionedSub = await ctx.db
                    .query("subscriptions")
                    .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
                    .filter((q) => q.eq(q.field("agentId"), mentionedAgent))
                    .first();
                if (!mentionedSub) {
                    await ctx.db.insert("subscriptions", { agentId: mentionedAgent, taskId: args.taskId });
                }
            }
        }

        // Notify all subscribers (except author and already mentioned)
        const subscribers = await ctx.db
            .query("subscriptions")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .collect();

        for (const sub of subscribers) {
            if (sub.agentId !== args.author && !mentions.includes(sub.agentId)) {
                await ctx.db.insert("notifications", {
                    mentionedAgent: sub.agentId,
                    sourceType: "message",
                    sourceId: messageId,
                    content: `New comment in "${task.title}": ${args.content.slice(0, 100)}...`,
                    delivered: false,
                    createdAt: now,
                });
            }
        }

        // Log activity
        await ctx.db.insert("activity_feed", {
            agentId: args.author,
            action: "commented",
            targetType: "task",
            targetId: args.taskId,
            summary: `${args.author} commented on "${task.title}"`,
            createdAt: now,
        });

        return messageId;
    },
});

export const list = query({
    args: { taskId: v.id("tasks") },
    handler: async (ctx: QueryCtx, args) => {
        return await ctx.db
            .query("task_comments")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .order("asc")
            .collect();
    },
});
