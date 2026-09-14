import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Product, ProductsResponse } from '../api/products.types';
import { updateProductStock } from '../api/productsApi';
import { ItemDetailsModal } from './ItemDetailsModal';

vi.mock('../api/productsApi', () => ({
  getProduct: vi.fn(),
  updateProductStock: vi.fn(),
}));

const product: Product = {
  id: 1,
  title: 'Clinical thermometer',
  description: 'Digital thermometer',
  category: 'health',
  price: 12,
  stock: 4,
  thumbnail: 'thermometer.png',
};

describe('ItemDetailsModal stock correction', () => {
  it('updates detail and list caches and blocks closing while saving', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false },
      },
    });
    const listKey = ['products', 10, 0, '', '', 'title', 'asc'];
    queryClient.setQueryData<Product>(['product', product.id], product);
    queryClient.setQueryData<ProductsResponse>(listKey, {
      products: [product],
      total: 1,
      skip: 0,
      limit: 10,
    });

    let resolveUpdate!: (updatedProduct: Product) => void;
    vi.mocked(updateProductStock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <ItemDetailsModal itemId={product.id} onClose={onClose} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Item Details');
    await user.type(screen.getByLabelText('New stock'), '8');
    await user.click(screen.getByRole('button', { name: 'Save Stock' }));

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByLabelText('New stock')).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      resolveUpdate({ ...product, stock: 8 });
    });

    expect(await screen.findByText('Stock updated successfully.')).toBeInTheDocument();
    expect(screen.getByText('Current stock: 8')).toBeInTheDocument();
    await waitFor(() => {
      expect(queryClient.getQueryData<ProductsResponse>(listKey)?.products[0].stock).toBe(8);
    });

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
