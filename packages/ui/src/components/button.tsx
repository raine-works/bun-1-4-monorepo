import { cn } from '@ui/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'pink' | 'emerald' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-sm',
	pink: 'bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold shadow-sm',
	emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-sm',
	secondary: 'bg-white/10 hover:bg-white/15 text-slate-100 font-medium border border-white/10',
	danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold',
	ghost: 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent font-medium',
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: 'px-2.5 py-1 text-xs min-h-[30px] rounded-md',
	md: 'px-4 py-2 text-xs min-h-[36px] rounded-lg',
	lg: 'px-5 py-2.5 text-sm min-h-[42px] rounded-lg',
};

/**
 * Reusable accessible Button component.
 */
export function Button({ variant = 'secondary', size = 'md', className, disabled, children, ...props }: ButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={cn(
				'inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
				variantStyles[variant],
				sizeStyles[size],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
