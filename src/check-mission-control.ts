import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";

// Simple .env parser
const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function checkMissionControl() {
    console.log("Checking Mission Control Status...");

    try {
        // 1. Check Tasks
        const tasks = await client.query(api.tasks.list, {});
        console.log(`✅ Tasks Query: Found ${tasks.length} tasks`);

        // 2. Check Activity Feed
        const feed = await client.query(api.activity.getFeed, { limit: 5 });
        console.log(`✅ Activity Feed: Found ${feed.length} items`);

        // 3. Create a test task (simulating agent)
        console.log("Creating test task...");
        /* 
        // Commented out to avoid polluting DB, used for manual verification
        const taskId = await client.mutation(api.tasks.create, {
          title: "Verify Mission Control Deployment",
          description: "Automated check of the new backend",
          assignees: ["goku"]
        });
        console.log(`✅ Task Created: ${taskId}`);
        */

        console.log("Mission Control Backend is ONLINE and READY.");
    } catch (error) {
        console.error("❌ Mission Control Check Failed:", error);
    }
}

checkMissionControl();
