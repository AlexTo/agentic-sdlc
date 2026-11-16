import { AppRouter } from '@agentic-sdlc/notes-api';
import { useQueryClient } from '@tanstack/react-query';
import {
  createTRPCClient,
  HTTPLinkOptions,
  httpLink,
  TRPCClient,
} from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { useRuntimeConfig } from '../hooks/useRuntimeConfig';

export interface NotesApiTRPCContextValue {
  optionsProxy: ReturnType<typeof createTRPCOptionsProxy<AppRouter>>;
  client: TRPCClient<AppRouter>;
}

export const NotesApiTRPCContext =
  createContext<NotesApiTRPCContextValue | null>(null);

export const NotesApiClientProvider: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const runtimeConfig = useRuntimeConfig();
  const apiUrl = runtimeConfig.apis.NotesApi;

  const container = useMemo<NotesApiTRPCContextValue>(() => {
    const linkOptions: HTTPLinkOptions<any> = {
      url: apiUrl,
      // TODO: Add headers required by your custom authorizer
      headers: {},
    };

    const client = createTRPCClient<AppRouter>({
      links: [httpLink(linkOptions)],
    });

    const optionsProxy = createTRPCOptionsProxy<AppRouter>({
      client,
      queryClient,
    });

    return { optionsProxy, client };
  }, [apiUrl, queryClient]);

  return (
    <NotesApiTRPCContext.Provider value={container}>
      {children}
    </NotesApiTRPCContext.Provider>
  );
};

export default NotesApiClientProvider;
