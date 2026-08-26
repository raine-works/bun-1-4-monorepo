import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface ServerInfo {
  name: string;
  bunVersion: string;
  platform: string;
  arch: string;
}

export function DashboardPage() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("checking...");
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadStatus() {
      try {
        const [healthRes, infoRes] = await Promise.all([fetch("/api/health"), fetch("/api/info")]);
        if (healthRes.ok) {
          const data = (await healthRes.json()) as { status: string };
          setHealthStatus(data.status);
        }
        if (infoRes.ok) {
          const data = (await infoRes.json()) as ServerInfo;
          setServerInfo(data);
        }
      } catch {
        setHealthStatus("offline");
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Overview Card */}
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ⚡ System &amp; Runtime Overview
            </h2>
            <p className="text-xs text-slate-300">
              Bun native runtime telemetry and backend API status
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            {healthStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
            <div className="text-slate-400 font-semibold text-[11px]">RUNTIME</div>
            <div className="text-pink-300 font-bold mt-1">
              Bun v{serverInfo?.bunVersion || "1.4.0"}
            </div>
          </div>
          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
            <div className="text-slate-400 font-semibold text-[11px]">PLATFORM</div>
            <div className="text-sky-300 font-bold mt-1">
              {serverInfo ? `${serverInfo.platform} (${serverInfo.arch})` : "darwin (arm64)"}
            </div>
          </div>
          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
            <div className="text-slate-400 font-semibold text-[11px]">ROUTER</div>
            <div className="text-emerald-300 font-bold mt-1">TanStack v1.170</div>
          </div>
          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
            <div className="text-slate-400 font-semibold text-[11px]">COMPILER</div>
            <div className="text-amber-300 font-bold mt-1">React 19 Native</div>
          </div>
        </div>
      </section>

      {/* Routing Showcase Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SPA Routing Demonstration */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono">
                ⚡ SPA Navigation
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Intra-MFE Client Transitions</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              TanStack Router handles routing purely in-memory on the client. State persists and
              transitions occur with zero page reloads.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
            <button
              type="button"
              onClick={() => setCount((c) => c + 1)}
              aria-label={`Increment state counter. Current count is ${count}`}
              className="bg-white/10 hover:bg-white/15 text-slate-100 px-3 py-1.5 rounded-md font-mono transition-colors min-h-[36px]"
            >
              State Counter: {count}
            </button>
            <Link
              to="/tasks"
              aria-label="Navigate to Tasks Manager"
              className="text-sky-300 hover:text-sky-200 font-medium flex items-center gap-1 min-h-[36px]"
            >
              Open Tasks &rarr;
            </Link>
          </div>
        </section>

        {/* Global Routing Demonstration */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30 font-mono">
                🌐 Global Routing
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Inter-MFE Shell Navigation</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Navigating across micro-frontends loads the respective MFE package bundle hosted under
              scoped sub-paths by the Bun server.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-xs">
            <a
              href="/store"
              aria-label="Navigate to Store Micro-Frontend"
              className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 px-3 py-1.5 rounded-md font-semibold transition-colors flex-1 text-center min-h-[36px] flex items-center justify-center"
            >
              Store MFE (/store)
            </a>
            <a
              href="/docs"
              aria-label="Navigate to Docs Micro-Frontend"
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40 px-3 py-1.5 rounded-md font-semibold transition-colors flex-1 text-center min-h-[36px] flex items-center justify-center"
            >
              Docs MFE (/docs)
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
