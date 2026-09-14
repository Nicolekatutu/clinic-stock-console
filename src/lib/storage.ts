const ACCESS_TOKEN_KEY = 'clinic_stock_access_token';
const REFRESH_TOKEN_KEY = 'clinic_stock_refresh_token';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const AUTH_EXPIRED_EVENT = 'clinic-stock-auth-expired';

export const notifyAuthExpired = (): void => {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};
