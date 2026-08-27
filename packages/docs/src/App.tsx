import { RouterProvider } from '@tanstack/react-router';
import { createAppRouter, defaultRouter } from '@/router';

/**
 * Props passed to the Docs application root component.
 */
export interface AppProps {
	/** Optional preconfigured router instance (e.g. MemoryHistory router for server-side testing). */
	router?: typeof defaultRouter;
}

/**
 * Root component for the Docs micro-frontend (`/docs`).
 * Integrates TanStack Router with scoped basepath `/docs` and client routes (`/docs/`, `/docs/guides`, `/docs/api`).
 *
 * @param props - Component properties including optional custom router instance.
 * @returns The rendered TanStack `RouterProvider` component tree.
 */
export function App(props?: AppProps) {
	const routerInstance = props?.router ?? defaultRouter;
	return <RouterProvider router={routerInstance} />;
}

export { createAppRouter, defaultRouter, defaultRouter as router };
