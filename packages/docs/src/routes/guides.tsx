import { Link } from '@tanstack/react-router';

export function DocsGuidesPage() {
	const GUIDES = [
		{
			title: '1. Adding TanStack Router Routes',
			desc: 'Define `createRoute` with path and component, then register into `rootRoute.addChildren([...])`. Export router factory with memory history for test isolation.',
		},
		{
			title: '2. Adding a Micro-Frontend',
			desc: "Create `packages/<name>` with scoped `basepath: '/<name>'` in TanStack Router, configure `publicPath: '/<name>/'` in `scripts/build.ts`, and register in `packages/backend/scripts/build.ts`.",
		},
		{
			title: '3. Inter-MFE vs Intra-MFE Routing',
			desc: 'Use standard HTML `<a>` tags for navigating across MFE boundaries (`/`, `/store`, `/docs`). Use TanStack `<Link>` for zero-reload client-side navigation within an MFE.',
		},
		{
			title: '4. Catch-All 404 Resolution',
			desc: 'Assign `defaultNotFoundComponent` and `notFoundComponent` in `createRootRoute` to gracefully catch unmapped client paths with telemetry details.',
		},
		{
			title: '5. React 19 Native React Compiler',
			desc: 'Enabled via `Bun.build({ reactCompiler: true })` in each package build script. Automatically memoizes components and hooks with zero Babel/SWC configuration.',
		},
		{
			title: '6. Single Standalone Binary Compilation',
			desc: 'Run `bun run build` to bundle all MFEs into `packages/backend/dist/mfes` and compile a standalone executable binary using `--asset=mfes` virtual filesystem.',
		},
		{
			title: '7. Resilient Live Reload with SSE',
			desc: 'Development mode injects SSE live reload with file-write readiness polling, automatic reconnection, and asset error auto-recovery (automatically disabled in production).',
		},
		{
			title: '8. Distroless Multi-Stage Container Image',
			desc: 'Deploy via `gcr.io/distroless/cc-debian12` for an ultra-lightweight ~47MB container containing solely the compiled standalone binary with zero external dependencies.',
		},
	];

	return (
		<div className="flex flex-col gap-4">
			<section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
				<div className="flex items-center justify-between border-b border-white/5 pb-3">
					<div>
						<h2 className="text-base font-bold text-white flex items-center gap-2">🛠️ Developer Guides</h2>
						<p className="text-xs text-slate-300">Complete architecture, routing, bundling, and deployment guides</p>
					</div>
					<Link
						to="/"
						aria-label="Back to Overview"
						className="text-xs text-sky-300 hover:text-sky-200 hover:underline min-h-[36px] inline-flex items-center"
					>
						&larr; Back to Overview
					</Link>
				</div>

				<div className="flex flex-col gap-2.5">
					{GUIDES.map((g) => (
						<div key={g.title} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs">
							<h3 className="font-bold text-sky-300 mb-1">{g.title}</h3>
							<p className="text-slate-300 text-[11px] leading-relaxed">{g.desc}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
