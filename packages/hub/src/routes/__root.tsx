import { MfeFooter, MfeHeader } from '@app/ui';
import { NotFoundPage } from '@hub/routes/not-found';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
	component: RootLayout,
	notFoundComponent: NotFoundPage,
});

function RootLayout() {
	return (
		<div className="mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4">
			<MfeHeader
				packageName="@app/hub"
				badgeVariant="pink"
				subtitle="Bun 1.4 + React 19 Monorepo"
				title="Hub Micro-Frontend"
				gradientClass="bg-linear-to-r from-white via-pink-300 to-sky-400"
				scope="/"
				scopeColorClass="text-pink-300 font-bold"
				activeMfe="hub"
				spaLabel="Hub SPA"
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
					Dashboard
				</Link>
				<Link
					to="/tasks"
					activeProps={{
						className: 'text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
				>
					Tasks
				</Link>
				<Link
					to="/about"
					activeProps={{
						className: 'text-sky-200 bg-sky-500/20 border-sky-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
				>
					Architecture
				</Link>
				<Link
					to="/not-found-demo"
					className="text-rose-300 hover:bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-md transition-colors text-xs font-mono min-h-9 inline-flex items-center justify-center"
					title="Test 404 Catch-All Handler"
				>
					Test 404
				</Link>
			</MfeHeader>

			{/* Main Outlet for TanStack Router Child Routes */}
			<main className="w-full">
				<Outlet />
			</main>

			<MfeFooter label="Hub MFE • Client-Side Routing with TanStack Router" basepath="/" />
		</div>
	);
}
