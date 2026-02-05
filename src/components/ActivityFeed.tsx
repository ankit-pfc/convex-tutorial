import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ActivityFeed() {
    // Use getFeed instead of list
    const activitiesQuery = useQuery(api.activity.getFeed, {});
    const activities = Array.isArray(activitiesQuery) ? activitiesQuery : [];

    return (
        <div className="flex-col bg-card border-l border-subtle" style={{ width: '320px' }}>
            <div className="p-4 border-b border-subtle">
                <h3 className="text-sm uppercase tracking-wider text-muted">● Live Feed</h3>
            </div>

            <div className="flex-col overflow-y-auto p-4 gap-0" style={{ height: 'calc(100vh - 60px)' }}>
                {activities.map((act: any, i: number) => (
                    <div key={act._id} className="flex-row gap-3 relative pb-6 group">
                        {/* Connector Line */}
                        {i !== activities.length - 1 && (
                            <div className="absolute top-2 left-[5px] w-[1px] h-full bg-border-subtle group-hover:bg-border-strong transition-colors"></div>
                        )}

                        {/* Dot */}
                        <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-accent-secondary shrink-0 z-10 mt-1.5"></div>

                        <div className="flex-col gap-1">
                            <div className="flex-row gap-2 items-center">
                                <span className="text-xs font-semibold text-text-primary">{act.agentId}</span>
                                <span className="text-[0.65rem] uppercase tracking-wider text-muted border border-border-subtle px-1.5 rounded-sm">{act.action}</span>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed">
                                {act.summary}
                            </p>

                            <span className="text-[0.65rem] text-muted">
                                {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center text-muted text-xs mt-10 italic">
                        No recent activity
                    </div>
                )}
            </div>
        </div>
    );
}
