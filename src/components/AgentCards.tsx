import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AgentCards() {
    // Real DBZ agents from convex/tasks.ts
    const agents = [
        { name: "goku", role: "Super Saiyan", status: "working" },
        { name: "gohan", role: "Scholar Warrior", status: "working" },
        { name: "krilin", role: "Destructo Disk", status: "working" },
        { name: "picollo", role: "Namekian Tactician", status: "working" },
        { name: "vegita", role: "Prince of Saiyans", status: "working" },
        { name: "trunks", role: "Time Traveler", status: "working" },
        { name: "bulma", role: "Tech Genius", status: "working" },
        { name: "tien", role: "Tri-Beam Master", status: "working" },
        { name: "chichi", role: "Tiger Mom", status: "working" },
    ];

    return (
        <div className="flex-col gap-4 p-4" style={{ width: '280px', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-paper)' }}>
            <div className="flex-row justify-between items-center mb-4">
                <h3 className="text-sm uppercase tracking-wider text-muted">Agents</h3>
                <span className="badge" style={{ background: '#E0E0E0', color: '#555' }}>{agents.length}</span>
            </div>

            <div className="flex-col gap-1 overflow-y-auto pt-2" style={{ height: 'calc(100vh - 70px)' }}>
                {agents.map((agent) => (
                    <div key={agent.name} className="flex-row items-center gap-3 p-2.5 rounded-lg hover:bg-bg-subtle transition-colors cursor-pointer group">
                        <div
                            className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-transparent group-hover:border-border-strong transition-colors"
                        >
                            {agent.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium text-text-primary capitalize truncate">{agent.name}</span>
                            <span className="text-[0.65rem] text-muted truncate">{agent.role}</span>
                        </div>
                        <span className={`badge ${agent.status === 'working' ? 'badge-working' : 'badge-idle'}`}>
                            {agent.status === 'working' ? 'WRK' : 'IDL'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
