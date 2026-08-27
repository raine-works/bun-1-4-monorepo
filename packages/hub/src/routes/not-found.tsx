import { NotFoundView } from '@app/ui';

/**
 * Global 404 Handler for the Hub Micro-Frontend and Root Shell.
 * Renders when an unmatched route is requested internally or globally.
 */
export function NotFoundPage() {
	return (
		<NotFoundView
			appName="Hub Micro-Frontend"
			packageName="@app/hub"
			badgeLabel="Global Frontend 404 Handler"
			basepath="/"
			unmatchedPathLabel="Unmatched Path:"
			activeMfeColorClass="text-pink-300"
			primaryLink={{
				to: '/',
				label: '← Return to Hub Home',
				ariaLabel: 'Return to Hub Home',
				className:
					'bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm min-h-[36px] inline-flex items-center',
			}}
			externalLinks={[
				{
					href: '/store',
					label: 'Switch to Store (/store) →',
					ariaLabel: 'Switch to Store Micro-Frontend',
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
