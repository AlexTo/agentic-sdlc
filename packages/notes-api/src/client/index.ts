import { createTRPCClient, HTTPLinkOptions, httpLink } from '@trpc/client';
import { AppRouter } from '../router.js';

export interface NotesApiClientConfig {
  readonly url: string;
}

export const createNotesApiClient = (config: NotesApiClientConfig) => {
  const linkOptions: HTTPLinkOptions<any> = {
    url: config.url,
  };
  return createTRPCClient<AppRouter>({
    links: [httpLink(linkOptions)],
  });
};
