import { NotFoundView } from '@app/ui';

/**
 * Global 404 Handler for the Store Micro-Frontend.
 * Catches unmapped routes under the `/store` scoped basepath.
 */
export function NotFoundPage() {
	return (
		<NotFoundView
			appName="Store Micro-Frontend"
			packageName="@app/store"
			badgeLabel="Store MFE 404 Handler"
			basepath="/store"
			unmatchedPathLabel="Unmatched Subpath:"
			activeMfeColorClass="text-emerald-300"
			primaryLink={{
				to: '/',
				label: '← Return to Store Catalog',
				ariaLabel: 'Return to Store Catalog',
				className:
					'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm min-h-[36px] inline-flex items-center',
			}}
			externalLinks={[
				{
					href: '/',
					label: 'Switch to Hub (/) →',
					ariaLabel: 'Switch to Hub Micro-Frontend',
				},
				{
					href: '/docs',
					label: 'Switch to Docs (/docs) →',
					ariaLabel: 'Switch to Docs Micro-Frontend',
				},
			]}
		/>
	);
}
