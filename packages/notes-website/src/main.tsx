import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { createRoot } from 'react-dom/client';
import NotesApiClientProvider from './components/NotesApiClientProvider';
import QueryClientProvider from './components/QueryClientProvider';
import RuntimeConfigProvider from './components/RuntimeConfig';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import { routeTree } from './routeTree.gen';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type RouterProviderContext = {
  runtimeConfig?: ReturnType<typeof useRuntimeConfig>;
};

const router = createRouter({
  routeTree,
  context: { runtimeConfig: undefined },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const runtimeConfig = useRuntimeConfig();
  return <RouterProvider router={router} context={{ runtimeConfig }} />;
};

const root = document.getElementById('root');
root &&
  createRoot(root).render(
    <React.StrictMode>
      <RuntimeConfigProvider>
        <QueryClientProvider>
          <NotesApiClientProvider>
            <App />
          </NotesApiClientProvider>
        </QueryClientProvider>
      </RuntimeConfigProvider>
    </React.StrictMode>,
  );
