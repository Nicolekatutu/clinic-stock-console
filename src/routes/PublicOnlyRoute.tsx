import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '../lib/storage';

export const PublicOnlyRoute = () => {
  const accessToken = getAccessToken();

  if (accessToken) {
    return <Navigate to="/items" replace />;
  }

  return <Outlet />;
};
