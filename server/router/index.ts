import type {RouterClient} from '@orpc/server';
import lists from './lists';
import user from './user';

export const router = {
  user,
  lists,
};

export type Router = typeof router;
export type OrpcClient = RouterClient<Router>;
