import { Route as rootRoute } from '@store/routes/__root';
import { StoreCatalogPage } from '@store/routes/index';
import { NotFoundPage } from '@store/routes/not-found';
import { createMemoryHistory, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router';

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: StoreCatalogPage,
});

const cartRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: 'cart',
	component: lazyRouteComponent(() => import('@store/routes/cart'), 'StoreCartPage'),
});

const dealsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: 'deals',
	component: lazyRouteComponent(() => import('@store/routes/deals'), 'StoreDealsPage'),
});

export const routeTree = rootRoute.addChildren([indexRoute, cartRoute, dealsRoute]);

/**
 * Creates a configured TanStack Router instance for the Store micro-frontend.
 * Scoped to basepath `/store` with 404 handler and memory history for test/SSR.
 *
 * @param initialPath - The initial path used when instantiating in memory history mode (e.g. during SSR or unit tests).
 * @returns A fully initialized TanStack Router instance with scoped basepath `/store` and registered routes.
 */
export function createAppRouter(initialPath = '/store/') {
	return createRouter({
		routeTree,
		basepath: '/store',
		defaultNotFoundComponent: NotFoundPage,
		history: typeof window === 'undefined' ? createMemoryHistory({ initialEntries: [initialPath] }) : undefined,
	});
}

/** Default browser router instance for the Store micro-frontend. */
export const defaultRouter = createAppRouter();
/** Alias for defaultRouter. */
export const router = defaultRouter;
