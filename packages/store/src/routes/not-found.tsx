import { Link, useLocation } from "@tanstack/react-router";

/**
 * Global 404 Handler for the Store Micro-Frontend.
 * Catches unmapped routes under the `/store` scoped basepath.
 */
export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-[#161b22] border border-rose-500/30 rounded-xl shadow-lg my-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono mb-4">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
        Store MFE 404 Handler
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">404: Page Not Found</h2>
      <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-5">
        The requested path{" "}
        <code className="bg-[#0d1117] text-rose-300 px-2 py-0.5 rounded font-mono text-xs border border-[#30363d]">
          {location.pathname}
        </code>{" "}
        does not match any registered route in the{" "}
        <strong className="text-white">Store Micro-Frontend</strong>.
      </p>

      {/* Routing Telemetry Details */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-slate-300 font-mono mb-6 text-left w-full max-w-md">
        <div className="text-slate-400 mb-1.5 uppercase font-semibold text-[11px] tracking-wider">
          Routing Telemetry
        </div>
        <div className="flex justify-between py-0.5">
          <span>Active MFE:</span>
          <span className="text-emerald-300 font-semibold">@app/store</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Basepath:</span>
          <span className="text-sky-300 font-semibold">/store</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Unmatched Subpath:</span>
          <span className="text-rose-300 font-semibold">{location.pathname}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Resolution:</span>
          <span className="text-emerald-300">TanStack Router Catch-All</span>
        </div>
      </div>

      {/* Recovery Links */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link
          to="/"
          aria-label="Return to Store Catalog"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm min-h-[36px] inline-flex items-center"
        >
          &larr; Return to Store Catalog
        </Link>
        <a
          href="/"
          aria-label="Switch to Hub Micro-Frontend"
          className="bg-white/10 hover:bg-white/15 text-slate-100 font-medium px-4 py-2 rounded-lg text-xs transition-colors border border-white/10 min-h-[36px] inline-flex items-center"
        >
          Switch to Hub (/) &rarr;
        </a>
        <a
          href="/docs"
          aria-label="Switch to Docs Micro-Frontend"
          className="bg-white/10 hover:bg-white/15 text-slate-100 font-medium px-4 py-2 rounded-lg text-xs transition-colors border border-white/10 min-h-[36px] inline-flex items-center"
        >
          Switch to Docs (/docs) &rarr;
        </a>
      </div>
    </div>
  );
}
