import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import { clearTokens, notifyAuthExpired, setTokens } from '../../lib/storage';
import { getMe, login } from './api/authApi';
import { LoginPage } from './pages/LoginPage';

vi.mock('./api/authApi', () => ({
  login: vi.fn(),
  getMe: vi.fn(),
}));

const CurrentLocation = () => {
  const location = useLocation();
  return <p>{`${location.pathname}${location.search}`}</p>;
};

const LoginDestination = () => {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return <p>{`Return to ${from ?? '/items'}`}</p>;
};

const renderWithAppProviders = (
  initialEntry: string | { pathname: string; state?: unknown },
  routes: React.ReactNode,
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>{routes}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('authentication', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
    vi.mocked(getMe).mockReset();
  });

  it('logs in, stores both tokens, and returns to the preserved URL', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      gender: 'female',
      image: 'avatar.png',
    });
    const user = userEvent.setup();

    renderWithAppProviders(
      {
        pathname: '/login',
        state: {
          from: '/items?page=3&search=phone&category=beauty&sortBy=price&order=desc',
        },
      },
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/items" element={<CurrentLocation />} />
      </Routes>,
    );

    await user.type(screen.getByLabelText('Username'), 'emilys');
    await user.type(screen.getByLabelText('Password'), 'emilyspass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(login).toHaveBeenCalledWith({
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 1,
    });
    expect(localStorage.getItem('clinic_stock_access_token')).toBe('access-token');
    expect(localStorage.getItem('clinic_stock_refresh_token')).toBe('refresh-token');
    expect(
      await screen.findByText('/items?page=3&search=phone&category=beauty&sortBy=price&order=desc'),
    ).toBeInTheDocument();
  });

  it('redirects an unauthenticated user to login', () => {
    renderWithAppProviders(
      '/items?search=phone',
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/items" element={<p>Protected inventory</p>} />
        </Route>
        <Route path="/login" element={<p>Login screen</p>} />
      </Routes>,
    );

    expect(screen.getByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected inventory')).not.toBeInTheDocument();
  });

  it('preserves a shared item URL when authentication expires mid-session', async () => {
    setTokens('access-token', 'refresh-token');
    vi.mocked(getMe).mockResolvedValue({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      gender: 'female',
      image: 'avatar.png',
    });

    renderWithAppProviders(
      '/items/42?page=3&search=phone',
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/items/:id" element={<p>Shared item details</p>} />
        </Route>
        <Route path="/login" element={<LoginDestination />} />
      </Routes>,
    );

    expect(await screen.findByText('Shared item details')).toBeInTheDocument();

    act(() => {
      clearTokens();
      notifyAuthExpired();
    });

    expect(await screen.findByText('Return to /items/42?page=3&search=phone')).toBeInTheDocument();
  });
});
