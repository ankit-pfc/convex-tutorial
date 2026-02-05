import { useState, useEffect } from "react";
import "./index.css";
import { AgentCards } from "./components/AgentCards";
import { TaskBoard } from "./components/TaskBoard";
import { ActivityFeed } from "./components/ActivityFeed";
import { DocumentPanel } from "./components/DocumentPanel";

function CurrentTime() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-col items-end">
      <span className="text-xl font-medium tracking-tight text-text-primary leading-none">
        {date.toLocaleTimeString([], { hour12: false })}
      </span>
      <span className="text-[0.65rem] uppercase tracking-widest text-muted font-semibold mt-1">
        {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

function App() {
  return (
    <div className="flex-col h-screen w-full overflow-hidden bg-paper font-sans">
      {/* Header */}
      <header className="flex-row items-center justify-between px-6 py-3 border-b border-border-subtle bg-bg-card z-10 shadow-sm" style={{ height: 'var(--header-height)' }}>
        <div className="flex-row items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
            <div className="w-4 h-4 bg-accent-secondary rounded-sm"></div>
          </div>
          <div className="flex-col">
            <h1 className="text-lg font-bold tracking-tight leading-none">MISSION CONTROL</h1>
            <span className="text-[0.6rem] text-muted uppercase tracking-widest mt-0.5">Ankit's Bot Army</span>
          </div>
        </div>

        <div className="flex-row items-center gap-12">
          <div className="flex-col items-center">
            <span className="text-xl font-bold leading-none">14</span>
            <span className="text-[0.6rem] text-muted uppercase tracking-widest font-semibold mt-1">Agents Active</span>
          </div>

          <div className="flex-col items-center">
            <span className="text-xl font-bold leading-none text-text-primary">283</span>
            <span className="text-[0.6rem] text-muted uppercase tracking-widest font-semibold mt-1">Tasks in Queue</span>
          </div>
        </div>

        <div className="flex-row items-center gap-6">
          <div className="flex-row gap-2">
            <button className="text-xs bg-white hover:bg-gray-50 border border-gray-200 shadow-sm">
              ⏸ Paused
            </button>
            <button className="text-xs bg-white hover:bg-gray-50 border border-gray-200 shadow-sm">
              📂 Docs
            </button>
          </div>

          <div className="w-[1px] h-8 bg-border-subtle mx-2"></div>

          <CurrentTime />

          <div className="flex-row items-center gap-1.5 pl-2">
            <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse"></div>
            <span className="text-[0.65rem] font-bold text-accent-secondary uppercase tracking-wider">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 flex-row overflow-hidden bg-bg-paper">

        {/* Left: Agents */}
        <AgentCards />

        {/* Center: Mission Queue (Kanban) */}
        <TaskBoard />

        {/* Right: Live Feed */}
        <ActivityFeed />

      </div>

      {/* Overlays / Panels */}
      <DocumentPanel />
    </div>
  );
}

export default App;
