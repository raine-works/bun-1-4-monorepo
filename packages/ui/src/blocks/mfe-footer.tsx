import { cn } from '@ui/lib/utils';

export interface MfeFooterProps {
	/** MFE title text (e.g. 'Hub MFE • Client-Side Routing with TanStack Router'). */
	label: string;
	/** Scoped basepath (e.g. '/docs', '/', '/store'). */
	basepath: string;
	className?: string;
}

/**
 * Standard micro-frontend footer component.
 */
export function MfeFooter({ label, basepath, className }: MfeFooterProps) {
	return (
		<footer
			className={cn(
				'text-center text-xs text-slate-400 mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2',
				className,
			)}
		>
			<span>{label}</span>
			<span className="font-mono text-[11px] text-slate-400">Basepath: &quot;{basepath}&quot;</span>
		</footer>
	);
}
