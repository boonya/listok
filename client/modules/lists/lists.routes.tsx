import {createRoute} from '@tanstack/react-router';
import {authOnlyRoute} from '@/modules/auth/auth.routes';
import List from '@/modules/lists/list';
import Listing from '@/modules/lists/listing';
import rootRoute from '@/providers/router/root.route';

export const root = createRoute({
  path: '/lists',
  getParentRoute: () => rootRoute,
  beforeLoad: async ({context, location}) => {
    await authOnlyRoute(context.queryClient, location.href);
  },
});

export const lists = createRoute({
  path: '/',
  getParentRoute: () => root,
  component: Listing,
});

export const list = createRoute({
  path: '/$id',
  getParentRoute: () => root,
  component: List,
});

export default root.addChildren([lists, list]);
