import { Link } from '@tanstack/react-router';

export function AboutPage() {
	return (
		<div className="flex flex-col gap-4">
			<section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
				<div className="flex items-center justify-between border-b border-white/5 pb-3">
					<div>
						<h2 className="text-base font-bold text-white flex items-center gap-2">
							🏛️ Architecture &amp; Routing Topology
						</h2>
						<p className="text-xs text-slate-300">Micro-frontends coordination with TanStack Router</p>
					</div>
					<Link
						to="/"
						aria-label="Back to Dashboard"
						className="text-xs text-sky-300 hover:text-sky-200 hover:underline min-h-[36px] inline-flex items-center"
					>
						&larr; Back to Dashboard
					</Link>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
					<div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1.5">
						<span className="text-pink-300 font-bold font-mono">1. Inter-MFE Routing</span>
						<p className="text-slate-300 text-[11px] leading-relaxed">
							Global navigation between Hub (<code className="text-slate-200">/</code>), Store (
							<code className="text-slate-200">/store</code>), and Docs (<code className="text-slate-200">/docs</code>)
							via browser address resolution and backend SPA fallback.
						</p>
					</div>
					<div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1.5">
						<span className="text-sky-300 font-bold font-mono">2. Intra-MFE Routing</span>
						<p className="text-slate-300 text-[11px] leading-relaxed">
							TanStack Router client-side routing within each MFE with zero page reloads, deep linking, memory history
							testability, and instant transitions.
						</p>
					</div>
					<div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1.5">
						<span className="text-rose-300 font-bold font-mono">3. Global 404 Handler</span>
						<p className="text-slate-300 text-[11px] leading-relaxed">
							Unified catch-all handler for unmapped routes, providing telemetry badges and fast recovery navigation
							paths.
						</p>
					</div>
					<div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1.5">
						<span className="text-amber-300 font-bold font-mono">4. React 19 Compiler</span>
						<p className="text-slate-300 text-[11px] leading-relaxed">
							Native auto-memoization enabled via <code className="text-slate-200">reactCompiler: true</code> in
							Bun.build, eliminating manual <code className="text-slate-200">useMemo</code> /{' '}
							<code className="text-slate-200">useCallback</code> boilerplate.
						</p>
					</div>
					<div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1.5">
						<span className="text-emerald-300 font-bold font-mono">5. Standalone Binary</span>
						<p className="text-slate-300 text-[11px] leading-relaxed">
							Self-contained executable binary embeds all frontend static assets via Bun&apos;s virtual filesystem (
							<code className="text-slate-200">--asset=mfes</code>) for single-file deployment.
						</p>
					</div>
					<div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1.5">
						<span className="text-purple-300 font-bold font-mono">6. Live Reload SSE</span>
						<p className="text-slate-300 text-[11px] leading-relaxed">
							Development mode Server-Sent Events stream with asset write-readiness polling, reconnection resilience,
							and socket cleanup.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
