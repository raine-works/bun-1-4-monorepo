import { Outlet } from '@tanstack/react-router';
import { MfeFooter, type MfeFooterProps } from '@ui/blocks/mfe-footer';
import { MfeHeader, type MfeHeaderProps } from '@ui/blocks/mfe-header';
import { cn } from '@ui/lib/utils';
import type { ReactNode } from 'react';

export interface MfeLayoutProps {
	header: MfeHeaderProps;
	footer: MfeFooterProps;
	children?: ReactNode;
	className?: string;
}

/**
 * Standard responsive root layout container for micro-frontend applications.
 */
export function MfeLayout({ header, footer, children, className }: MfeLayoutProps) {
	return (
		<div className={cn('mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4', className)}>
			<MfeHeader {...header}>{header.children}</MfeHeader>

			<main className="w-full">{children ?? <Outlet />}</main>

			<MfeFooter {...footer} />
		</div>
	);
}
