import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductsResponse } from '../api/products.types';
import { getProducts } from '../api/productsApi';
import { useProducts } from './useProducts';

vi.mock('../api/productsApi', () => ({
  getProducts: vi.fn(),
}));

describe('useProducts request cancellation', () => {
  it('aborts a replaced search and only exposes the latest result', async () => {
    const replacedSignals: AbortSignal[] = [];
    let resolveLatest!: (response: ProductsResponse) => void;

    vi.mocked(getProducts).mockImplementation(({ search, signal }) => {
      if (search !== 'phone') {
        if (signal) {
          replacedSignals.push(signal);
        }
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }

      return new Promise((resolve) => {
        resolveLatest = resolve;
      });
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, rerender } = renderHook(
      ({ search }) => useProducts(10, 0, search, '', 'title', 'asc'),
      { initialProps: { search: 'p' }, wrapper },
    );

    await waitFor(() => expect(getProducts).toHaveBeenCalledTimes(1));
    rerender({ search: 'ph' });
    await waitFor(() => expect(getProducts).toHaveBeenCalledTimes(2));
    rerender({ search: 'pho' });
    await waitFor(() => expect(getProducts).toHaveBeenCalledTimes(3));
    rerender({ search: 'phone' });
    await waitFor(() => expect(getProducts).toHaveBeenCalledTimes(4));

    expect(replacedSignals).toHaveLength(3);
    expect(replacedSignals.every((signal) => signal.aborted)).toBe(true);

    act(() => {
      resolveLatest({
        products: [
          {
            id: 2,
            title: 'Phone',
            description: 'Latest result',
            category: 'smartphones',
            price: 100,
            stock: 3,
            thumbnail: 'phone.png',
          },
        ],
        total: 1,
        skip: 0,
        limit: 10,
      });
    });

    await waitFor(() => expect(result.current.data?.products[0].title).toBe('Phone'));
  });
});
