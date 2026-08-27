import { Link } from '@tanstack/react-router';

export function DocsOverviewPage() {
	const PACKAGES = [
		{ name: '@app/backend', path: '/api/*', role: 'Bun HTTP Server & API Host' },
		{ name: '@app/hub', path: '/', role: 'Primary Hub & Shell SPA' },
		{ name: '@app/store', path: '/store/*', role: 'Store Micro-Frontend' },
		{ name: '@app/docs', path: '/docs/*', role: 'Documentation Micro-Frontend' },
	];

	return (
		<div className="flex flex-col gap-4">
			<section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
				<div className="flex items-center justify-between border-b border-white/5 pb-3">
					<div>
						<h2 className="text-base font-bold text-white flex items-center gap-2">📖 Documentation Overview</h2>
						<p className="text-xs text-slate-300">Monorepo architecture specification and package map</p>
					</div>
					<div className="flex items-center gap-2">
						<Link
							to="/guides"
							aria-label="View Developer Guides"
							className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors min-h-[36px] inline-flex items-center"
						>
							View Guides &rarr;
						</Link>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{PACKAGES.map((pkg) => (
						<div
							key={pkg.name}
							className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 flex flex-col gap-1 text-xs"
						>
							<div className="flex items-center justify-between">
								<span className="font-mono font-bold text-sky-300">{pkg.name}</span>
								<code className="text-[11px] bg-white/5 text-slate-200 px-2 py-0.5 rounded border border-white/10 font-mono">
									{pkg.path}
								</code>
							</div>
							<p className="text-slate-300 text-[11px] mt-1">{pkg.role}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
