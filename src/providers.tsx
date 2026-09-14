import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
