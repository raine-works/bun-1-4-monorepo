import { NotFoundView } from '@app/ui';

/**
 * Global 404 Handler for the Docs Micro-Frontend.
 * Catches unmapped routes under the `/docs` scoped basepath.
 */
export function NotFoundPage() {
	return (
		<NotFoundView
			appName="Docs Micro-Frontend"
			packageName="@app/docs"
			badgeLabel="Docs MFE 404 Handler"
			basepath="/docs"
			unmatchedPathLabel="Unmatched Subpath:"
			activeMfeColorClass="text-sky-300"
			primaryLink={{
				to: '/',
				label: '← Return to Docs Overview',
				ariaLabel: 'Return to Docs Overview',
				className:
					'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm min-h-[36px] inline-flex items-center',
			}}
			externalLinks={[
				{
					href: '/',
					label: 'Switch to Hub (/) →',
					ariaLabel: 'Switch to Hub Micro-Frontend',
				},
				{
					href: '/store',
					label: 'Switch to Store (/store) →',
					ariaLabel: 'Switch to Store Micro-Frontend',
				},
			]}
		/>
	);
}
