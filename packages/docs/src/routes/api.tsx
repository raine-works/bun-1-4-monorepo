import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function DocsApiPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const runTest = async (endpoint: string) => {
    setTesting(true);
    setActiveEndpoint(endpoint);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch {
      setTestResult(JSON.stringify({ error: `Failed to connect to ${endpoint}` }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              🔌 API Reference
            </h2>
            <p className="text-xs text-slate-400">
              Interactive REST API explorer &amp; backend endpoints reference
            </p>
          </div>
          <Link to="/" className="text-xs text-sky-400 hover:underline">
            &larr; Back to Overview
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 text-xs">
          {/* GET /api/health */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-emerald-400 mr-2">GET</span>
              <code className="font-mono text-white">/api/health</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Service health status, process uptime, and timestamp
              </p>
            </div>
            <button
              type="button"
              onClick={() => runTest("/api/health")}
              disabled={testing}
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              {testing && activeEndpoint === "/api/health" ? "Testing..." : "Test ⚡"}
            </button>
          </div>

          {/* GET /api/info */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-emerald-400 mr-2">GET</span>
              <code className="font-mono text-white">/api/info</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Runtime telemetry (Bun version, platform, arch, standalone binary state)
              </p>
            </div>
            <button
              type="button"
              onClick={() => runTest("/api/info")}
              disabled={testing}
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              {testing && activeEndpoint === "/api/info" ? "Testing..." : "Test ⚡"}
            </button>
          </div>

          {/* GET /api/items */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-emerald-400 mr-2">GET</span>
              <code className="font-mono text-white">/api/items</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                List all tasks from in-memory store
              </p>
            </div>
            <button
              type="button"
              onClick={() => runTest("/api/items")}
              disabled={testing}
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              {testing && activeEndpoint === "/api/items" ? "Testing..." : "Test ⚡"}
            </button>
          </div>

          {/* POST /api/items */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-sky-400 mr-2">POST</span>
              <code className="font-mono text-white">/api/items</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Create new task item with JSON payload: <code>{`{ "title": string }`}</code>
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">REST JSON (201)</span>
          </div>

          {/* PATCH /api/items/:id */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-amber-400 mr-2">PATCH</span>
              <code className="font-mono text-white">/api/items/:id</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Update item completion status or title
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">REST JSON (200)</span>
          </div>

          {/* DELETE /api/items/:id */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-rose-400 mr-2">DELETE</span>
              <code className="font-mono text-white">/api/items/:id</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Delete task item from in-memory store by ID
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">REST JSON (200)</span>
          </div>

          {/* GET /api/live-reload */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-purple-400 mr-2">GET</span>
              <code className="font-mono text-white">/api/live-reload</code>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Server-Sent Events stream for dev live reload (disabled in production)
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">SSE Stream</span>
          </div>
        </div>

        {testResult && (
          <div className="bg-[#0d1117] border border-sky-500/30 rounded-lg p-3 font-mono text-emerald-400 text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">
              Response from {activeEndpoint}:
            </div>
            <pre className="m-0 overflow-x-auto">{testResult}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
