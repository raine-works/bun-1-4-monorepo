import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import type { JSX } from 'react';

export interface NotFoundExternalLink {
	href: string;
	label: string;
	ariaLabel?: string;
	className?: string;
}

export interface NotFoundPrimaryLink {
	to: string;
	label: string;
	ariaLabel?: string;
	className?: string;
}

export interface NotFoundViewProps {
	/** Application title displayed in description (e.g. 'Docs Micro-Frontend'). */
	appName: string;
	/** Package identifier displayed in telemetry (e.g. '@app/docs'). */
	packageName: string;
	/** Badge label displayed at top (e.g. 'Docs MFE 404 Handler'). */
	badgeLabel: string;
	/** Scoped basepath (e.g. '/docs', '/', '/store'). */
	basepath: string;
	/** Label for the unmatched path row (defaults to 'Unmatched Path:'). */
	unmatchedPathLabel?: string;
	/** Tailwind color class for active MFE badge in telemetry (defaults to 'text-sky-300'). */
	activeMfeColorClass?: string;
	/** Primary intra-MFE recovery link. */
	primaryLink: NotFoundPrimaryLink;
	/** Secondary global inter-MFE recovery links. */
	externalLinks?: NotFoundExternalLink[];
	/** Optional wrapper class overrides. */
	className?: string;
}

/**
 * Reusable 404 Not Found presentation block for micro-frontends with routing telemetry.
 */
export function NotFoundView({
	appName,
	packageName,
	badgeLabel,
	basepath,
	unmatchedPathLabel = 'Unmatched Subpath:',
	activeMfeColorClass = 'text-sky-300',
	primaryLink,
	externalLinks = [],
	className,
}: NotFoundViewProps): JSX.Element {
	const location = useLocation();

	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center text-center p-8 bg-[#161b22] border border-rose-500/30 rounded-xl shadow-lg my-4',
				className,
			)}
		>
			<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono mb-4">
				<span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
				{badgeLabel}
			</div>

			<h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">404: Page Not Found</h2>
			<p className="text-slate-300 text-xs sm:text-sm max-w-md mb-5">
				The requested path{' '}
				<code className="bg-[#0d1117] text-rose-300 px-2 py-0.5 rounded font-mono text-xs border border-[#30363d]">
					{location.pathname}
				</code>{' '}
				does not match any registered route in the <strong className="text-white">{appName}</strong>.
			</p>

			{/* Routing Telemetry Details */}
			<div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-slate-300 font-mono mb-6 text-left w-full max-w-md">
				<div className="text-slate-400 mb-1.5 uppercase font-semibold text-[11px] tracking-wider">
					Routing Telemetry
				</div>
				<div className="flex justify-between py-0.5">
					<span>Active MFE:</span>
					<span className={cn('font-semibold', activeMfeColorClass)}>{packageName}</span>
				</div>
				<div className="flex justify-between py-0.5">
					<span>Basepath:</span>
					<span className="text-emerald-300 font-semibold">{basepath}</span>
				</div>
				<div className="flex justify-between py-0.5">
					<span>{unmatchedPathLabel}</span>
					<span className="text-rose-300 font-semibold">{location.pathname}</span>
				</div>
				<div className="flex justify-between py-0.5">
					<span>Resolution:</span>
					<span className="text-emerald-300">TanStack Router Catch-All</span>
				</div>
			</div>

			{/* Recovery Links */}
			<div className="flex flex-wrap items-center justify-center gap-2.5">
				<Link
					to={primaryLink.to}
					aria-label={primaryLink.ariaLabel ?? primaryLink.label}
					className={cn(
						'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm min-h-[36px] inline-flex items-center',
						primaryLink.className,
					)}
				>
					{primaryLink.label}
				</Link>
				{externalLinks.map((link) => (
					<a
						key={link.href}
						href={link.href}
						aria-label={link.ariaLabel ?? link.label}
						className={cn(
							'bg-white/10 hover:bg-white/15 text-slate-100 font-medium px-4 py-2 rounded-lg text-xs transition-colors border border-white/10 min-h-[36px] inline-flex items-center',
							link.className,
						)}
					>
						{link.label}
					</a>
				))}
			</div>
		</div>
	);
}
