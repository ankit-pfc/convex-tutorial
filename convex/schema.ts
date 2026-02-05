import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Tasks with lifecycle
    tasks: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        status: v.union(
            v.literal("inbox"),
            v.literal("assigned"),
            v.literal("in_progress"),
            v.literal("review"),
            v.literal("done"),
            v.literal("blocked")
        ),
        assignees: v.array(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_assignee", ["assignees"]),

    // Comments on tasks
    task_comments: defineTable({
        taskId: v.id("tasks"),
        author: v.string(),
        content: v.string(),
        createdAt: v.number(),
    }).index("by_task", ["taskId"]),

    // Legacy chat messages
    messages: defineTable({
        user: v.string(),
        body: v.string(),
    }),

    // @mention notifications
    notifications: defineTable({
        mentionedAgent: v.string(),
        sourceType: v.string(),
        sourceId: v.string(),
        content: v.string(),
        delivered: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_agent", ["mentionedAgent"])
        .index("by_undelivered", ["delivered", "mentionedAgent"]),

    // Activity feed
    activity_feed: defineTable({
        agentId: v.string(),
        action: v.string(),
        targetType: v.string(),
        targetId: v.string(),
        summary: v.string(),
        createdAt: v.number(),
    }).index("by_time", ["createdAt"]),

    // Thread subscriptions
    subscriptions: defineTable({
        agentId: v.string(),
        taskId: v.id("tasks"),
    })
        .index("by_agent", ["agentId"])
        .index("by_task", ["taskId"]),

    // Documents/deliverables
    documents: defineTable({
        title: v.string(),
        content: v.string(),
        type: v.string(),
        authorId: v.string(),
        createdAt: v.number(),
    }).index("by_type", ["type"]),

    // Bot data key-value store
    bot_data: defineTable({
        key: v.string(),
        value: v.any(),
        agentId: v.optional(v.string()),
        updatedAt: v.number(),
    }).index("by_key", ["key"]),
});
