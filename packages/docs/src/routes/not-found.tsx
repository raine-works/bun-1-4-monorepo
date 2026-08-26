import { Link, useLocation } from "@tanstack/react-router";

/**
 * Global 404 Handler for the Docs Micro-Frontend.
 * Catches unmapped routes under the `/docs` scoped basepath.
 */
export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-[#161b22] border border-rose-500/30 rounded-xl shadow-lg my-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono mb-4">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        Docs MFE 404 Handler
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">404: Page Not Found</h2>
      <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-5">
        The requested path{" "}
        <code className="bg-[#0d1117] text-rose-300 px-2 py-0.5 rounded font-mono text-xs border border-[#30363d]">
          {location.pathname}
        </code>{" "}
        does not match any registered route in the{" "}
        <strong className="text-slate-200">Docs Micro-Frontend</strong>.
      </p>

      {/* Routing Telemetry Details */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-slate-400 font-mono mb-6 text-left w-full max-w-md">
        <div className="text-slate-500 mb-1.5 uppercase font-semibold text-[10px] tracking-wider">
          Routing Telemetry
        </div>
        <div className="flex justify-between py-0.5">
          <span>Active MFE:</span>
          <span className="text-sky-400 font-semibold">@app/docs</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Basepath:</span>
          <span className="text-emerald-400 font-semibold">/docs</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Unmatched Subpath:</span>
          <span className="text-rose-400 font-semibold">{location.pathname}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Resolution:</span>
          <span className="text-emerald-400">TanStack Router Catch-All</span>
        </div>
      </div>

      {/* Recovery Links */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link
          to="/"
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
        >
          &larr; Return to Docs Overview
        </Link>
        <a
          href="/"
          className="bg-white/10 hover:bg-white/15 text-slate-200 font-medium px-4 py-2 rounded-lg text-xs transition-colors border border-white/10"
        >
          Switch to Hub (/) &rarr;
        </a>
        <a
          href="/store"
          className="bg-white/10 hover:bg-white/15 text-slate-200 font-medium px-4 py-2 rounded-lg text-xs transition-colors border border-white/10"
        >
          Switch to Store (/store) &rarr;
        </a>
      </div>
    </div>
  );
}
