import { createMemoryHistory, createRoute, createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { AboutPage } from "./routes/about";
import { DashboardPage } from "./routes/index";
import { NotFoundPage } from "./routes/not-found";
import { TasksPage } from "./routes/tasks";

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: TasksPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
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
