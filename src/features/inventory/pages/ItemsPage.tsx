import { useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLogout } from '../../auth/hooks/useLogout';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { getStockStatus } from '../utils/stockStatus';

export const ItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriesQuery = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeItemIdParam } = useParams();
  const logout = useLogout();

  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const setPage = (newPage: number) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set('page', String(newPage));

      return newParams;
    });
  };

  const limit = 10;
  const skip = (page - 1) * limit;

  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebouncedValue(search, 400);
  const category = searchParams.get('category') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'title';
  const orderParam = searchParams.get('order');
  const order: 'asc' | 'desc' = orderParam === 'desc' ? 'desc' : 'asc';

  const routeItemId = Number(routeItemIdParam);
  const queryItemId = Number(searchParams.get('item'));
  const selectedItemId =
    Number.isInteger(routeItemId) && routeItemId > 0 ? routeItemId : queryItemId;

  const { data, isLoading, isFetching, isError, refetch } = useProducts(
    limit,
    skip,
    debouncedSearch,
    category,
    sortBy,
    order,
  );

  useEffect(() => {
    if (data && data.products.length === 0 && page > 1) {
      setSearchParams((currentParams) => {
        const newParams = new URLSearchParams(currentParams);
        newParams.set('page', '1');
        return newParams;
      });
    }
  }, [data, page, setSearchParams]);

  const clearFilters = () => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.delete('search');
      newParams.delete('category');
      newParams.delete('sortBy');
      newParams.delete('order');
      newParams.set('page', '1');
      return newParams;
    });
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-clinical-600 to-scrub-600 text-white shadow-sm">
              <svg
                className="size-5"
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
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">
                Clinic Stock Console
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">Inventory management</span>
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary shrink-0 px-3 py-2 sm:px-4"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Stock Items</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter and correct clinic stock levels.
            </p>
          </div>

          {isFetching && !isLoading && (
            <p className="badge bg-clinical-50 text-clinical-700 ring-clinical-200">
              <span
                aria-hidden="true"
                className="size-1.5 animate-pulse rounded-full bg-clinical-600"
              />
              Updating results...
            </p>
          )}
        </div>

        <section className="app-card mt-6 p-4 sm:p-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0 lg:col-span-2">
              <label htmlFor="search-items" className="field-label">
                Search
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                <input
                  id="search-items"
                  className="field-control pl-10"
                  type="search"
                  placeholder="Search stock items..."
                  value={search}
                  onChange={(event) => {
                    setSearchParams((currentParams) => {
                      const newParams = new URLSearchParams(currentParams);

                      if (event.target.value) {
                        newParams.set('search', event.target.value);
                      } else {
                        newParams.delete('search');
                      }

                      newParams.set('page', '1');
                      return newParams;
                    });
                  }}
                />
              </div>
            </div>

            <div className="min-w-0">
              <label htmlFor="category-filter" className="field-label">
                Category
              </label>
              <select
                id="category-filter"
                className="field-control capitalize"
                value={category}
                disabled={categoriesQuery.isLoading}
                onChange={(event) => {
                  setSearchParams((currentParams) => {
                    const newParams = new URLSearchParams(currentParams);

                    if (event.target.value) {
                      newParams.set('category', event.target.value);
                    } else {
                      newParams.delete('category');
                    }

                    newParams.set('page', '1');
                    return newParams;
                  });
                }}
              >
                <option value="">
                  {categoriesQuery.isLoading ? 'Loading categories...' : 'All categories'}
                </option>
                {categoriesQuery.data?.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3">
              <div className="min-w-0">
                <label htmlFor="sort-by" className="field-label">
                  Sort by
                </label>
                <select
                  id="sort-by"
                  className="field-control"
                  value={sortBy}
                  onChange={(event) => {
                    setSearchParams((currentParams) => {
                      const newParams = new URLSearchParams(currentParams);
                      newParams.set('sortBy', event.target.value);
                      newParams.set('page', '1');
                      return newParams;
                    });
                  }}
                >
                  <option value="title">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                </select>
              </div>

              <div className="min-w-0">
                <label htmlFor="sort-order" className="field-label">
                  Sort order
                </label>
                <select
                  id="sort-order"
                  className="field-control"
                  value={order}
                  onChange={(event) => {
                    setSearchParams((currentParams) => {
                      const newParams = new URLSearchParams(currentParams);
                      newParams.set('order', event.target.value);
                      newParams.set('page', '1');
                      return newParams;
                    });
                  }}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {categoriesQuery.isError && (
          <div
            role="alert"
            className="app-card mt-4 flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50 p-4"
          >
            <p className="text-sm text-amber-800">Unable to load categories.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => categoriesQuery.refetch()}
            >
              Try again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="app-card mt-6 p-6">
            <div className="flex items-center gap-3">
              <svg
                className="size-5 animate-spin text-clinical-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                />
              </svg>
              <p className="text-sm font-medium text-slate-700">Loading stock items...</p>
            </div>

            <ul aria-hidden="true" className="mt-5 space-y-3">
              {[0, 1, 2, 3, 4].map((row) => (
                <li key={row} className="flex items-center gap-4">
                  <span className="size-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                  <span className="h-4 flex-1 animate-pulse rounded-full bg-slate-100" />
                  <span className="hidden h-6 w-24 shrink-0 animate-pulse rounded-full bg-slate-100 sm:block" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {isError && (
          <div role="alert" className="app-card mt-6 border-rose-200 bg-rose-50/70 p-6 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </span>
            <p className="mt-4 text-sm font-medium text-rose-800">
              Unable to load stock items. Please check your connection and try again.
            </p>
            <button type="button" className="btn btn-primary mt-5" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && (!data || data.products.length === 0) && (
          <div className="app-card mt-6 p-8 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 8 12 3 3 8l9 5 9-5Z" />
                <path d="M3 8v8l9 5 9-5V8" />
                <path d="M12 13v8" />
              </svg>
            </span>
            <p className="mt-4 text-base font-medium text-slate-900">No stock items found.</p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search term, or clear the filters to see the full inventory.
            </p>
            <button type="button" className="btn btn-primary mt-5" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {!isLoading && !isError && data && data.products.length > 0 && (
          <section className="app-card mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <p className="text-sm text-slate-500">Total items: {data.total}</p>
              <p className="text-xs text-slate-400">Select an item to correct stock</p>
            </div>

            <ul className="min-w-0">
              {data.products.map((product) => {
                const status = getStockStatus(product.stock);

                return (
                  <li key={product.id} className="border-t border-slate-100 first:border-t-0">
                    <button
                      type="button"
                      className="flex w-full max-w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-clinical-50/60 focus-visible:bg-clinical-50 sm:gap-4 sm:px-5"
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('item');
                        navigate({
                          pathname: `/items/${product.id}`,
                          search: newParams.toString(),
                        });
                      }}
                    >
                      <img
                        className="size-12 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                        src={product.thumbnail}
                        alt=""
                        loading="lazy"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900">
                          {product.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500 capitalize">
                          {product.category} · ${product.price}
                        </span>
                      </span>

                      <span className={`badge shrink-0 ${status.className}`}>{status.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <nav
              aria-label="Product pages"
              className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5"
            >
              <button
                type="button"
                className="btn btn-secondary px-3 sm:px-4"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>

              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-900">Page {page}</span>{' '}
                <span>of {totalPages}</span>
              </p>

              <button
                type="button"
                className="btn btn-secondary px-3 sm:px-4"
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= data.total}
              >
                Next
              </button>
            </nav>
          </section>
        )}
      </main>

      {Number.isInteger(selectedItemId) && selectedItemId > 0 && (
        <ItemDetailsModal
          itemId={selectedItemId}
          onClose={() => {
            const newParams = new URLSearchParams(location.search);
            newParams.delete('item');
            navigate(
              {
                pathname: '/items',
                search: newParams.toString(),
              },
              { replace: true },
            );
          }}
        />
      )}
    </>
  );
};
