import { useContext } from 'react';
import {
  NotesApiTRPCContext,
  type NotesApiTRPCContextValue,
} from '../components/NotesApiClientProvider';

export const useNotesApi = (): NotesApiTRPCContextValue['optionsProxy'] => {
  const container = useContext(NotesApiTRPCContext);
  if (!container) {
    throw new Error('useNotesApi must be used within NotesApiClientProvider');
  }
  return container.optionsProxy;
};

export const useNotesApiClient = (): NotesApiTRPCContextValue['client'] => {
  const container = useContext(NotesApiTRPCContext);
  if (!container) {
    throw new Error(
      'useNotesApiClient must be used within NotesApiClientProvider',
    );
  }
  return container.client;
};
