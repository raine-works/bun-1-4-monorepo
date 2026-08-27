import { useLocation } from '@tanstack/react-router';
import { GlobalMfeNav } from '@ui/blocks/global-mfe-nav';
import { Badge, type BadgeVariant } from '@ui/components/badge';
import { TelemetryBadge } from '@ui/components/telemetry-badge';
import { cn } from '@ui/lib/utils';
import type { ReactNode } from 'react';

export interface MfeHeaderProps {
	/** Package identifier (e.g. '@app/hub'). */
	packageName: string;
	/** Badge color variant. */
	badgeVariant?: BadgeVariant;
	/** Subtitle text beside package badge. */
	subtitle: string;
	/** Main heading title. */
	title: string;
	/** Tailwind gradient text class for title. */
	gradientClass?: string;
	/** Micro-frontend route scope (e.g. '/', '/docs', '/store'). */
	scope: string;
	/** Scope color class for telemetry. */
	scopeColorClass?: string;
	/** Active MFE identifier for global switcher. */
	activeMfe: 'hub' | 'store' | 'docs' | string;
	/** Label for intra-MFE navigation section (e.g. 'Hub SPA:'). */
	spaLabel: string;
	/** Intra-MFE navigation items (typically TanStack Router `<Link>`s). */
	children?: ReactNode;
	/** Optional header class override. */
	className?: string;
}

/**
 * Standard micro-frontend application header with routing telemetry and navigation.
 */
export function MfeHeader({
	packageName,
	badgeVariant = 'sky',
	subtitle,
	title,
	gradientClass = 'bg-linear-to-r from-white via-sky-300 to-cyan-400',
	scope,
	scopeColorClass = 'text-sky-300 font-bold',
	activeMfe,
	spaLabel,
	children,
	className,
}: MfeHeaderProps) {
	const location = useLocation();

	return (
		<header className={cn('flex flex-col gap-4 border-b border-white/10 pb-5', className)}>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<Badge variant={badgeVariant}>{packageName}</Badge>
						<span className="text-slate-300 text-xs font-mono">{subtitle}</span>
					</div>
					<h1 className={cn('text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent', gradientClass)}>
						{title}
					</h1>
				</div>

				<TelemetryBadge scope={scope} route={location.pathname} scopeColorClass={scopeColorClass} />
			</div>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs">
				<GlobalMfeNav activeMfe={activeMfe} />

				{children && (
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
							⚡ {spaLabel}
						</span>
						<nav className="flex gap-1.5 flex-wrap" aria-label={`${spaLabel} Navigation`}>
							{children}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
