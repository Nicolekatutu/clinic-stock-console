import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AUTH_EXPIRED_EVENT, getAccessToken } from '../lib/storage';

export const ProtectedRoute = () => {
  const location = useLocation();
  const authQuery = useAuth();
  const queryClient = useQueryClient();

  const [hasToken, setHasToken] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.removeQueries({ queryKey: ['product'] });
      queryClient.removeQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product-categories'] });
      setHasToken(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [queryClient]);

  if (!hasToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (authQuery.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <p className="app-card px-6 py-4 text-sm text-slate-600">Checking your session...</p>
      </div>
    );
  }

  if (authQuery.isError) {
    if (getAccessToken()) {
      return (
        <div className="flex min-h-svh items-center justify-center px-4">
          <div role="alert" className="app-card max-w-sm p-6 text-center">
            <p className="text-sm font-medium text-slate-900">Unable to verify your session.</p>
            <button
              type="button"
              className="btn btn-primary mt-4"
              onClick={() => authQuery.refetch()}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return <Outlet />;
};
