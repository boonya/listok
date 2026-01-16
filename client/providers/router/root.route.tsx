import type {QueryClient} from '@tanstack/react-query';
import {createRootRouteWithContext, Outlet} from '@tanstack/react-router';
import {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import AppHeader from '@/components/app-header';
import GeneralErrorMessage from '@/components/errors/general-message';
import Progressbar from '@/components/progressbar';
import {QueryClientProvider} from '@/providers/query-client';
import TanStackDevtools from '@/providers/tanstack-devtools';

function RootLayout() {
  const {queryClient} = rootRoute.useRouteContext();

  return (
    <ErrorBoundary fallback={<GeneralErrorMessage sx={{height: '100dvh'}} />}>
      <Suspense fallback={<Progressbar sx={{height: '100dvh'}} />}>
        <QueryClientProvider client={queryClient}>
          <AppHeader />
          <Outlet />
          <TanStackDevtools />
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export interface RouterContext {
  queryClient: QueryClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

export default rootRoute;
