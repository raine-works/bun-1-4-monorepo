import { cn } from '@ui/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn('bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4', className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardHeader({ className, children, ...props }: CardProps) {
	return (
		<div className={cn('flex items-center justify-between border-b border-white/5 pb-3', className)} {...props}>
			{children}
		</div>
	);
}

export function CardTitle({ className, children, ...props }: CardProps) {
	return (
		<h3 className={cn('text-base font-bold text-white flex items-center gap-2', className)} {...props}>
			{children}
		</h3>
	);
}

export function CardDescription({ className, children, ...props }: CardProps) {
	return (
		<p className={cn('text-xs text-slate-300', className)} {...props}>
			{children}
		</p>
	);
}

export function CardContent({ className, children, ...props }: CardProps) {
	return (
		<div className={cn('flex flex-col gap-3', className)} {...props}>
			{children}
		</div>
	);
}

export function CardFooter({ className, children, ...props }: CardProps) {
	return (
		<div className={cn('flex items-center justify-between pt-3 border-t border-white/5 text-xs', className)} {...props}>
			{children}
		</div>
	);
}
