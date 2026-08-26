import { Route as rootRoute } from "@hub/routes/__root";
import { DashboardPage } from "@hub/routes/index";
import { NotFoundPage } from "@hub/routes/not-found";
import {
  createMemoryHistory,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: lazyRouteComponent(() => import("@hub/routes/tasks"), "TasksPage"),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: lazyRouteComponent(() => import("@hub/routes/about"), "AboutPage"),
});

export const routeTree = rootRoute.addChildren([indexRoute, tasksRoute, aboutRoute]);

/**
 * Creates a configured TanStack Router instance for the Hub micro-frontend.
 * Configured with global 404 handler and memory history for server/test environments.
 *
 * @param initialPath - The initial path used when instantiating in memory history mode (e.g. during SSR or unit tests).
 * @returns A fully initialized TanStack Router instance with registered routes (`/`, `/tasks`, `/about`, and 404).
 */
export function createAppRouter(initialPath = "/") {
  return createRouter({
    routeTree,
    defaultNotFoundComponent: NotFoundPage,
    history:
      typeof window === "undefined"
        ? createMemoryHistory({ initialEntries: [initialPath] })
        : undefined,
  });
}

/** Default browser router instance for the Hub micro-frontend. */
export const defaultRouter = createAppRouter();
/** Alias for defaultRouter. */
export const router = defaultRouter;
