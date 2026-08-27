import { cn } from '@ui/lib/utils';

export interface GlobalMfeLink {
	name: string;
	href: string;
	label: string;
	title: string;
	activeColorClass: string;
}

export const DEFAULT_GLOBAL_MFES: GlobalMfeLink[] = [
	{
		name: 'hub',
		href: '/',
		label: 'Hub (/)',
		title: 'Hub MFE (Root Basepath)',
		activeColorClass: 'bg-pink-500/20 text-pink-200 border-pink-500/50',
	},
	{
		name: 'store',
		href: '/store',
		label: 'Store (/store)',
		title: 'Store MFE (/store Basepath)',
		activeColorClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
	},
	{
		name: 'docs',
		href: '/docs',
		label: 'Docs (/docs)',
		title: 'Docs MFE (/docs Basepath)',
		activeColorClass: 'bg-sky-500/20 text-sky-200 border-sky-500/50',
	},
];

export interface GlobalMfeNavProps {
	activeMfe: 'hub' | 'store' | 'docs' | string;
	links?: GlobalMfeLink[];
	className?: string;
}

/**
 * Global micro-frontend switcher navigation bar.
 */
export function GlobalMfeNav({ activeMfe, links = DEFAULT_GLOBAL_MFES, className }: GlobalMfeNavProps) {
	return (
		<div className={cn('flex items-center gap-2 flex-wrap', className)}>
			<span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
				🌐 Global MFEs:
			</span>
			<nav className="flex gap-1.5 flex-wrap" aria-label="Global Micro-Frontends">
				{links.map((link) => {
					const isActive = link.name === activeMfe;
					const linkClass = isActive
						? cn(
								'font-semibold px-3 py-1.5 rounded-md transition-colors min-h-9 inline-flex items-center justify-center border',
								link.activeColorClass,
							)
						: 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent font-medium px-3 py-1.5 rounded-md transition-colors min-h-9 inline-flex items-center justify-center';

					return (
						<a key={link.name} href={link.href} className={linkClass} title={link.title} aria-label={link.label}>
							{link.label}
						</a>
					);
				})}
			</nav>
		</div>
	);
}
