import { MfeFooter, MfeHeader } from '@app/ui';
import { NotFoundPage } from '@docs/routes/not-found';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
	component: DocsRootLayout,
	notFoundComponent: NotFoundPage,
});

function DocsRootLayout() {
	return (
		<div className="mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4">
			<MfeHeader
				packageName="@app/docs"
				badgeVariant="sky"
				subtitle="Scoped Basepath: /docs"
				title="Docs Micro-Frontend"
				gradientClass="bg-linear-to-r from-white via-sky-300 to-cyan-400"
				scope="/docs"
				scopeColorClass="text-sky-300 font-bold"
				activeMfe="docs"
				spaLabel="Docs SPA"
			>
				<Link
					to="/"
					activeProps={{
						className: 'text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
					activeOptions={{ exact: true }}
				>
					Overview
				</Link>
				<Link
					to="/guides"
					activeProps={{
						className: 'text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
				>
					Guides
				</Link>
				<Link
					to="/api"
					activeProps={{
						className: 'text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
				>
					API
				</Link>
				<Link
					to="/not-found-demo"
					className="text-rose-300 hover:bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-md transition-colors text-xs font-mono min-h-9 inline-flex items-center justify-center"
					title="Test Docs 404 Handler"
				>
					Test 404
				</Link>
			</MfeHeader>

			{/* Main Outlet for TanStack Router Child Routes */}
			<main className="w-full">
				<Outlet />
			</main>

			<MfeFooter label="Docs MFE • Client-Side Routing with TanStack Router" basepath="/docs" />
		</div>
	);
}
