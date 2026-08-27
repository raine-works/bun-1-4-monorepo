import { cn } from '@ui/lib/utils';
import type { HTMLAttributes } from 'react';

export interface TelemetryBadgeProps extends HTMLAttributes<HTMLDivElement> {
	scope: string;
	route: string;
	scopeColorClass?: string;
	routeColorClass?: string;
}

/**
 * Micro-frontend router telemetry badge showing active scope and current SPA route.
 */
export function TelemetryBadge({
	scope,
	route,
	scopeColorClass = 'text-pink-300 font-bold',
	routeColorClass = 'text-sky-300 font-semibold',
	className,
	...props
}: TelemetryBadgeProps) {
	return (
		<div
			className={cn(
				'bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[11px] font-mono text-slate-200 flex flex-col gap-1 self-start sm:self-auto',
				className,
			)}
			{...props}
		>
			<div className="flex items-center gap-2">
				<span className="text-slate-400">MFE Scope:</span>
				<span className={cn(scopeColorClass)}>{scope}</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-slate-400">SPA Route:</span>
				<span className={cn(routeColorClass)}>{route}</span>
			</div>
		</div>
	);
}
