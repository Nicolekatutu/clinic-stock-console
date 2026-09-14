import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

const PulseMark = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 12h4l2.2-5.5L12 17.5l2.3-5.5H21.5" />
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginMutation.mutate(
      {
        username,
        password,
        expiresInMins: 1,
      },
      {
        onSuccess: () => {
          const from = location.state?.from ?? '/items';

          navigate(from, { replace: true });
        },
      },
    );
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-linear-to-br from-clinical-800 via-clinical-700 to-scrub-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-scrub-300/20 blur-2xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 ring-inset">
            <PulseMark className="size-6" />
          </span>
          <span className="text-lg font-semibold">Clinic Stock Console</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-3xl leading-snug font-semibold text-white xl:text-4xl">
            Keep every ward stocked and every count accurate.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-clinical-50">
            {[
              'Find any item in seconds with search, filters and sorting.',
              'Spot low and out-of-stock items at a glance.',
              'Correct stock counts without leaving the shelf.',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg
                    className="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-clinical-100">
          Secure access for authorised clinic staff only.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-clinical-600 to-scrub-600 text-white shadow-sm">
              <PulseMark className="size-6" />
            </span>
            <span className="text-base font-semibold text-slate-900">Clinic Stock Console</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Clinic Stock Console
          </h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage clinic stock.</p>

          <form onSubmit={handleSubmit} className="app-card mt-8 p-6 sm:p-8">
            <div>
              <label htmlFor="username" className="field-label">
                Username
              </label>
              <input
                id="username"
                className="field-control"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                placeholder="e.g. emilys"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                className="field-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            {loginMutation.isError && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200 ring-inset"
              >
                Unable to sign in. Please check your username and password.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary mt-6 w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
