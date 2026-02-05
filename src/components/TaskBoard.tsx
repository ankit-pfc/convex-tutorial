import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const COLUMNS = [
    { id: "inbox", label: "Inbox" },
    { id: "assigned", label: "Assigned" },
    { id: "in_progress", label: "In Progress" },
    { id: "review", label: "Review" },
    { id: "done", label: "Done" },
];

export function TaskBoard() {
    const tasksQuery = useQuery(api.tasks.list, {});
    const tasks = Array.isArray(tasksQuery) ? tasksQuery : [];

    return (
        <div className="flex-1 flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-subtle flex-row justify-between items-center">
                <h2 className="text-lg">Mission Queue</h2>
                <div className="flex-row gap-2">
                    <span className="text-xs text-muted">Checking Status...</span>
                </div>
            </div>

            <div className="flex-1 flex-row overflow-x-auto p-4 gap-4 bg-subtle">
                {COLUMNS.map((col) => {
                    const colTasks = tasks.filter((t: any) => t.status === col.id);
                    return (
                        <div key={col.id} className="flex-col gap-3" style={{ minWidth: '280px', width: '280px' }}>
                            <div className="flex-row justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted">● {col.label}</span>
                                <span className="text-xs text-muted bg-paper px-2 py-1 rounded-full">{colTasks.length}</span>
                            </div>

                            <div className="flex-col gap-3 overflow-y-auto" style={{ height: 'calc(100vh - 180px)', paddingBottom: '20px' }}>
                                {colTasks.map((task: any) => (
                                    <div key={task._id} className="card flex-col gap-3 group hover:border-accent-primary transition-colors cursor-pointer">
                                        <div className="flex-row justify-between items-start">
                                            <h4 className="text-sm font-semibold leading-snug text-text-primary flex-1 pr-2">{task.title}</h4>
                                            {/* Priority Indicator Dot if needed */}
                                        </div>

                                        {task.description && (
                                            <p className="text-xs text-secondary line-clamp-2 leading-relaxed opacity-80">{task.description}</p>
                                        )}

                                        <div className="flex-row justify-between items-center mt-1 pt-3 border-t border-dotted border-border-subtle">
                                            <div className="flex-row gap-[-4px] pl-1">
                                                {task.assignees?.map((a: string, i: number) => (
                                                    <div key={a} className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[0.5rem] uppercase font-bold text-gray-600" style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: 10 - i }}>
                                                        {a.slice(0, 1)}
                                                    </div>
                                                ))}
                                                {(!task.assignees || task.assignees.length === 0) && (
                                                    <span className="text-[0.6rem] text-muted italic">Unassigned</span>
                                                )}
                                            </div>
                                            <span className="text-[0.65rem] text-muted font-medium tracking-wide">
                                                {task.createdAt ? new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State placeholder */}
                                {colTasks.length === 0 && (
                                    <div className="p-8 border border-dashed border-border-subtle rounded-lg text-center bg-gray-50/50">
                                        <span className="text-xs text-muted font-medium">No tasks</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
