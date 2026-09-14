import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ItemsPage } from './ItemsPage';

vi.mock('../hooks/useCategories');
vi.mock('../hooks/useProducts');
vi.mock('../../auth/hooks/useLogout', () => ({
  useLogout: () => vi.fn(),
}));
vi.mock('../components/ItemDetailsModal', () => ({
  ItemDetailsModal: () => null,
}));

const product = {
  id: 1,
  title: 'Clinical thermometer',
  description: 'Digital thermometer',
  category: 'health',
  price: 12,
  stock: 4,
  thumbnail: 'thermometer.png',
};

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderPage = (initialEntry = '/items') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ItemsPage />
      <LocationDisplay />
    </MemoryRouter>,
  );

const setProductsResult = (overrides: Record<string, unknown>) => {
  vi.mocked(useProducts).mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useProducts>);
};

describe('ItemsPage states and URL state', () => {
  beforeEach(() => {
    vi.mocked(useCategories).mockReturnValue({
      data: ['beauty', 'groceries', 'health'],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCategories>);
  });

  it('displays the initial product loading state', () => {
    setProductsResult({ isLoading: true, isFetching: true });
    renderPage();

    expect(screen.getByText('Loading stock items...')).toBeInTheDocument();
  });

  it('displays a useful error state and retries', async () => {
    const refetch = vi.fn();
    setProductsResult({ isError: true, refetch });
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText(/Unable to load stock items/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('displays an empty state and clears filters', async () => {
    setProductsResult({
      data: { products: [], total: 0, skip: 20, limit: 10 },
    });
    const user = userEvent.setup();
    renderPage('/items?page=3&search=phone&category=beauty&sortBy=price&order=desc');

    expect(screen.getByText('No stock items found.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/items?page=1');
  });

  it('preserves URL filters and resets page when a filter changes', async () => {
    setProductsResult({
      data: { products: [product], total: 100, skip: 40, limit: 10 },
    });
    const user = userEvent.setup();
    renderPage('/items?page=5&search=phone&category=beauty&sortBy=price&order=desc');

    expect(screen.getByText('Page 5')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Category'), 'groceries');

    const location = screen.getByTestId('location').textContent;
    expect(location).toContain('page=1');
    expect(location).toContain('search=phone');
    expect(location).toContain('category=groceries');
    expect(location).toContain('sortBy=price');
    expect(location).toContain('order=desc');
  });

  it('opens an item at a shareable route while preserving list state', async () => {
    setProductsResult({
      data: { products: [product], total: 100, skip: 20, limit: 10 },
    });
    const user = userEvent.setup();
    renderPage('/items?page=3&search=thermometer&category=health&sortBy=price&order=desc');

    await user.click(screen.getByRole('button', { name: /Clinical thermometer/ }));

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/items/1?page=3&search=thermometer&category=health&sortBy=price&order=desc',
    );
  });
});
