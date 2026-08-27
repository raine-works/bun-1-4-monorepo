/**
 * Responsive breakpoint hook.
 *
 * Provides a reactive boolean that tracks whether the viewport width
 * is below the mobile breakpoint (768 px). Uses `matchMedia` for
 * efficient, event-driven updates — no polling or resize listeners.
 *
 * @module hooks/use-mobile
 */

import * as React from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Viewport widths below this value are considered "mobile". */
const MOBILE_BREAKPOINT = 768;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the viewport width is below {@link MOBILE_BREAKPOINT}.
 *
 * On the first render the value is `false` (SSR-safe default) until the
 * effect fires and reads the actual viewport width. Subsequent changes
 * are pushed reactively via the `matchMedia` `change` event.
 */
export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

	React.useEffect(() => {
		// Create a media query that fires when the viewport crosses the breakpoint.
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		mql.addEventListener('change', onChange);

		// Initialise with the current viewport width.
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

		return () => mql.removeEventListener('change', onChange);
	}, []);

	// Coerce `undefined` (pre-hydration) to `false`.
	return !!isMobile;
}
