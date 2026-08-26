import { Route as rootRoute } from "@docs/routes/__root";
import { DocsOverviewPage } from "@docs/routes/index";
import { NotFoundPage } from "@docs/routes/not-found";
import {
  createMemoryHistory,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DocsOverviewPage,
});

const guidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guides",
  component: lazyRouteComponent(() => import("@docs/routes/guides"), "DocsGuidesPage"),
});

const apiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api",
  component: lazyRouteComponent(() => import("@docs/routes/api"), "DocsApiPage"),
});

export const routeTree = rootRoute.addChildren([indexRoute, guidesRoute, apiRoute]);

/**
 * Creates a configured TanStack Router instance for the Docs micro-frontend.
 * Scoped to basepath `/docs` with 404 handler and memory history for test/SSR.
 *
 * @param initialPath - The initial path used when instantiating in memory history mode (e.g. during SSR or unit tests).
 * @returns A fully initialized TanStack Router instance with scoped basepath `/docs` and registered routes.
 */
export function createAppRouter(initialPath = "/docs/") {
  return createRouter({
    routeTree,
    basepath: "/docs",
    defaultNotFoundComponent: NotFoundPage,
    history:
      typeof window === "undefined"
        ? createMemoryHistory({ initialEntries: [initialPath] })
        : undefined,
  });
}

/** Default browser router instance for the Docs micro-frontend. */
export const defaultRouter = createAppRouter();
/** Alias for defaultRouter. */
export const router = defaultRouter;
