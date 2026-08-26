import { createRootRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { NotFoundPage } from "./not-found";

export const Route = createRootRoute({
  component: DocsRootLayout,
  notFoundComponent: NotFoundPage,
});

function DocsRootLayout() {
  const location = useLocation();

  return (
    <div className="mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4">
      {/* Header & MFE Monorepo Navigator */}
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block bg-sky-500/15 text-sky-300 border border-sky-500/40 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                @app/docs
              </span>
              <span className="text-slate-300 text-xs font-mono">Scoped Basepath: /docs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-white via-sky-300 to-cyan-400 bg-clip-text text-transparent">
              Docs Micro-Frontend
            </h1>
          </div>

          {/* Micro-Frontend Router Telemetry Badge */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[11px] font-mono text-slate-200 flex flex-col gap-1 self-start sm:self-auto">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">MFE Scope:</span>
              <span className="text-sky-300 font-bold">/docs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">SPA Route:</span>
              <span className="text-emerald-300 font-semibold">{location.pathname}</span>
            </div>
          </div>
        </div>

        {/* Global Inter-MFE Routing vs Internal Intra-MFE SPA Routing */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs">
          {/* Global Inter-MFE Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              🌐 Global MFEs:
            </span>
            <nav className="flex gap-1.5 flex-wrap" aria-label="Global Micro-Frontends">
              <a
                href="/"
                className="text-slate-300 hover:text-white hover:bg-white/5 border border-transparent font-medium px-3 py-1.5 rounded-md transition-colors min-h-[36px] inline-flex items-center justify-center"
                title="Hub MFE (Root Basepath)"
                aria-label="Hub Micro-Frontend (/)"
              >
                Hub (/)
              </a>
              <a
                href="/store"
                className="text-slate-300 hover:text-white hover:bg-white/5 border border-transparent font-medium px-3 py-1.5 rounded-md transition-colors min-h-[36px] inline-flex items-center justify-center"
                title="Store MFE (/store Basepath)"
                aria-label="Store Micro-Frontend (/store)"
              >
                Store (/store)
              </a>
              <a
                href="/docs"
                className="bg-sky-500/20 text-sky-200 border border-sky-500/50 font-semibold px-3 py-1.5 rounded-md transition-colors min-h-[36px] inline-flex items-center justify-center"
                title="Docs MFE (/docs Basepath)"
                aria-label="Docs Micro-Frontend (/docs)"
              >
                Docs (/docs)
              </a>
            </nav>
          </div>

          {/* Internal TanStack Router Client SPA Links */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              ⚡ Docs SPA:
            </span>
            <nav className="flex gap-1.5 flex-wrap" aria-label="Docs SPA Navigation">
              <Link
                to="/"
                activeProps={{
                  className: "text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold",
                }}
                inactiveProps={{
                  className: "text-slate-300 hover:text-white hover:bg-white/5 border-transparent",
                }}
                className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-[36px] inline-flex items-center justify-center"
                activeOptions={{ exact: true }}
              >
                Overview
              </Link>
              <Link
                to="/guides"
                activeProps={{
                  className: "text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold",
                }}
                inactiveProps={{
                  className: "text-slate-300 hover:text-white hover:bg-white/5 border-transparent",
                }}
                className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-[36px] inline-flex items-center justify-center"
              >
                Guides
              </Link>
              <Link
                to="/api"
                activeProps={{
                  className: "text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold",
                }}
                inactiveProps={{
                  className: "text-slate-300 hover:text-white hover:bg-white/5 border-transparent",
                }}
                className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-[36px] inline-flex items-center justify-center"
              >
                API
              </Link>
              <Link
                to="/not-found-demo"
                className="text-rose-300 hover:bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-md transition-colors text-xs font-mono min-h-[36px] inline-flex items-center justify-center"
                title="Test Docs 404 Handler"
              >
                Test 404
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Outlet for TanStack Router Child Routes */}
      <main className="w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Docs MFE • Client-Side Routing with TanStack Router</span>
        <span className="font-mono text-[11px] text-slate-400">Basepath: &quot;/docs&quot;</span>
      </footer>
    </div>
  );
}
