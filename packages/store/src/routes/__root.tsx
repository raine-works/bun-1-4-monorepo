import { MfeFooter, MfeHeader } from '@app/ui';
import { NotFoundPage } from '@store/routes/not-found';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
	component: StoreRootLayout,
	notFoundComponent: NotFoundPage,
});

function StoreRootLayout() {
	return (
		<div className="mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4">
			<MfeHeader
				packageName="@app/store"
				badgeVariant="emerald"
				subtitle="Scoped Basepath: /store"
				title="Store Micro-Frontend"
				gradientClass="bg-linear-to-r from-white via-emerald-300 to-teal-400"
				scope="/store"
				scopeColorClass="text-emerald-300 font-bold"
				activeMfe="store"
				spaLabel="Store SPA"
			>
				<Link
					to="/"
					activeProps={{
						className: 'text-emerald-200 bg-emerald-500/20 border-emerald-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
					activeOptions={{ exact: true }}
				>
					Catalog
				</Link>
				<Link
					to="/cart"
					activeProps={{
						className: 'text-emerald-200 bg-emerald-500/20 border-emerald-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
				>
					Cart
				</Link>
				<Link
					to="/deals"
					activeProps={{
						className: 'text-emerald-200 bg-emerald-500/20 border-emerald-400/50 shadow-sm font-semibold',
					}}
					inactiveProps={{
						className: 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
					}}
					className="px-3 py-1.5 rounded-md border transition-all text-xs min-h-9 inline-flex items-center justify-center"
				>
					Deals
				</Link>
				<Link
					to="/not-found-demo"
					className="text-rose-300 hover:bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-md transition-colors text-xs font-mono min-h-9 inline-flex items-center justify-center"
					title="Test Store 404 Handler"
				>
					Test 404
				</Link>
			</MfeHeader>

			{/* Main Outlet for TanStack Router Child Routes */}
			<main className="w-full">
				<Outlet />
			</main>

			<MfeFooter label="Store MFE • Client-Side Routing with TanStack Router" basepath="/store" />
		</div>
	);
}
