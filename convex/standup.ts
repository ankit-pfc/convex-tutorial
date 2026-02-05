import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Agent roster
const AGENTS = {
    goku: { name: "Goku", role: "Squad Lead" },
    gohan: { name: "Gohan", role: "Research" },
    krilin: { name: "Krilin", role: "SEO" },
    picollo: { name: "Picollo", role: "Content" },
    vegita: { name: "Vegita", role: "Social" },
    trunks: { name: "Trunks", role: "Email" },
    bulma: { name: "Bulma", role: "Video Ops" },
    tien: { name: "Tien", role: "Video Director" },
    chichi: { name: "Chi-Chi", role: "Personal Brand" },
} as const;

export const generateStandup = internalQuery({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        // Get tasks by status
        const allTasks = await ctx.db.query("tasks").collect();
        const completed = allTasks.filter(
            (t) => t.status === "done" && t.updatedAt >= oneDayAgo
        );
        const inProgress = allTasks.filter((t) => t.status === "in_progress");
        const blocked = allTasks.filter((t) => t.status === "blocked");
        const needsReview = allTasks.filter((t) => t.status === "review");

        // Get recent activity for key decisions
        const recentActivity = await ctx.db
            .query("activity_feed")
            .withIndex("by_time")
            .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
            .order("desc")
            .take(20);

        // Format date
        const date = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        // Build markdown
        let markdown = `📊 DAILY STANDUP — ${date}\n\n`;

        markdown += "✅ COMPLETED TODAY\n";
        if (completed.length === 0) {
            markdown += "• No tasks completed today\n";
        } else {
            for (const task of completed) {
                const assigneeNames = task.assignees
                    .map((a) => AGENTS[a as keyof typeof AGENTS]?.name || a)
                    .join(", ");
                markdown += `• ${assigneeNames}: ${task.title}\n`;
            }
        }

        markdown += "\n🔄 IN PROGRESS\n";
        if (inProgress.length === 0) {
            markdown += "• No tasks in progress\n";
        } else {
            for (const task of inProgress) {
                const assigneeNames = task.assignees
                    .map((a) => AGENTS[a as keyof typeof AGENTS]?.name || a)
                    .join(", ");
                markdown += `• ${assigneeNames}: ${task.title}\n`;
            }
        }

        markdown += "\n🚫 BLOCKED\n";
        if (blocked.length === 0) {
            markdown += "• No blocked tasks\n";
        } else {
            for (const task of blocked) {
                const assigneeNames = task.assignees
                    .map((a) => AGENTS[a as keyof typeof AGENTS]?.name || a)
                    .join(", ");
                markdown += `• ${assigneeNames}: ${task.title}\n`;
            }
        }

        markdown += "\n👀 NEEDS REVIEW\n";
        if (needsReview.length === 0) {
            markdown += "• No tasks awaiting review\n";
        } else {
            for (const task of needsReview) {
                markdown += `• ${task.title}\n`;
            }
        }

        // Key decisions from activity
        const decisions = recentActivity.filter(
            (a) => a.action.includes("decision") || a.action.includes("approved")
        );
        if (decisions.length > 0) {
            markdown += "\n📝 KEY DECISIONS\n";
            for (const d of decisions.slice(0, 5)) {
                markdown += `• ${d.summary}\n`;
            }
        }

        return markdown;
    },
});

export const sendStandup = internalAction({
    args: { telegramBotToken: v.string(), telegramChatId: v.string() },
    handler: async (ctx, args) => {
        const standup = await ctx.runQuery(internal.standup.generateStandup, {});

        const response = await fetch(
            `https://api.telegram.org/bot${args.telegramBotToken}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: args.telegramChatId,
                    text: standup,
                    parse_mode: "Markdown",
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Telegram API error: ${error}`);
        }

        return { success: true, timestamp: Date.now() };
    },
});
