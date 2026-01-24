import {
  createRoute,
  createRouter,
  Navigate,
  RouterProvider as Provider,
} from '@tanstack/react-router';
import NotFound from '@/components/errors/404';
import GeneralError from '@/components/errors/general-message';
import Progressbar from '@/components/progressbar';
import {signInRoute, signUpRoute} from '@/modules/auth/auth.routes';
import listsRoutes from '@/modules/lists/lists.routes';
import {queryClient} from '@/providers/query-client';
import rootRoute from '@/providers/router/root.route';

const homeRoute = createRoute({
  path: '/',
  getParentRoute: () => rootRoute,
  component: () => <Navigate to="/lists" />,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  signInRoute,
  signUpRoute,
  listsRoutes,
]);

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => <Progressbar />,
  defaultErrorComponent: () => <GeneralError />,
  defaultNotFoundComponent: () => <NotFound />,
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function RouterProvider() {
  return <Provider router={router} />;
}
