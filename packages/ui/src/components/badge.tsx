import { cn } from '@ui/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'sky' | 'pink' | 'emerald' | 'amber' | 'rose' | 'slate' | 'default';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	children: ReactNode;
	pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
	sky: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
	pink: 'bg-pink-500/15 text-pink-300 border-pink-500/40',
	emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
	amber: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
	rose: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
	slate: 'bg-slate-800 text-slate-300 border-slate-700',
	default: 'bg-white/10 text-slate-200 border-white/20',
};

const pulseStyles: Record<BadgeVariant, string> = {
	sky: 'bg-sky-400',
	pink: 'bg-pink-400',
	emerald: 'bg-emerald-400',
	amber: 'bg-amber-400',
	rose: 'bg-rose-400',
	slate: 'bg-slate-400',
	default: 'bg-white',
};

/**
 * Reusable badge indicator component.
 */
export function Badge({ variant = 'default', pulse = false, className, children, ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 border font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
				variantStyles[variant],
				className,
			)}
			{...props}
		>
			{pulse && <span className={cn('w-2 h-2 rounded-full animate-pulse', pulseStyles[variant])} />}
			{children}
		</span>
	);
}
