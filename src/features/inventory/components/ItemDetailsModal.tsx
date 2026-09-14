import { useEffect, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useUpdateProductStock } from '../hooks/useUpdateProductStock';
import { getStockStatus } from '../utils/stockStatus';

interface ItemDetailsModalProps {
  itemId: number;
  onClose: () => void;
}

export const ItemDetailsModal = ({ itemId, onClose }: ItemDetailsModalProps) => {
  const { data, isLoading, isError, refetch } = useProduct(itemId);
  const updateStockMutation = useUpdateProductStock();
  const [stock, setStock] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !updateStockMutation.isPending) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, updateStockMutation.isPending]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !updateStockMutation.isPending) {
      onClose();
    }
  };

  const handleSaveStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (stock === '') {
      setSaveError('Please enter a stock count.');
      return;
    }

    const newStock = Number(stock);

    if (!Number.isInteger(newStock) || newStock < 0) {
      setSaveError('Stock must be a whole number greater than or equal to 0.');
      return;
    }

    try {
      setSaveError('');
      setSaveSuccess('');

      await updateStockMutation.mutateAsync({
        id: itemId,
        stock: newStock,
      });

      setStock('');
      setSaveSuccess('Stock updated successfully.');
    } catch {
      setSaveError('Unable to update stock. Please try again.');
    }
  };

  const status = data ? getStockStatus(data.stock) : null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-details-heading"
        className="max-h-[92svh] w-full max-w-lg min-w-0 overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <h2 id="item-details-heading" className="text-lg font-semibold">
            Item Details
          </h2>

          <button
            type="button"
            aria-label="Close item details"
            onClick={onClose}
            disabled={updateStockMutation.isPending}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5">
          {isLoading && (
            <div className="flex items-center gap-3 py-6">
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
              <p className="text-sm text-slate-600">Loading item details...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-center">
              <p className="text-sm font-medium text-rose-800">Unable to load item details.</p>

              <button type="button" className="btn btn-primary mt-4" onClick={() => refetch()}>
                Try again
              </button>
            </div>
          )}

          {data && (
            <div className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row">
                <img
                  className="size-24 shrink-0 self-start rounded-2xl border border-slate-200 bg-slate-50 object-cover"
                  src={data.thumbnail}
                  alt={data.title}
                />

                <div className="min-w-0">
                  <h3 className="text-base font-semibold break-words">{data.title}</h3>
                  <p className="mt-1 text-sm break-words text-slate-500">{data.description}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <p className="badge bg-slate-50 text-slate-600 capitalize ring-slate-200">
                      Category: {data.category}
                    </p>
                    <p className="badge bg-slate-50 text-slate-600 ring-slate-200">
                      Price: ${data.price}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 ring-1 ring-inset ${status?.className}`}
              >
                <p className="text-base font-semibold">Current stock: {data.stock}</p>
                <p className="text-xs font-medium">{status?.label}</p>
              </div>

              <form
                onSubmit={handleSaveStock}
                className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <label htmlFor="new-stock" className="field-label">
                  New stock
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="new-stock"
                    className="field-control sm:flex-1"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    disabled={updateStockMutation.isPending}
                    required
                    autoFocus
                  />

                  <button
                    type="submit"
                    className="btn btn-primary shrink-0"
                    disabled={updateStockMutation.isPending}
                  >
                    {updateStockMutation.isPending ? 'Saving...' : 'Save Stock'}
                  </button>
                </div>

                {saveSuccess && (
                  <p
                    role="status"
                    className="mt-3 rounded-xl bg-scrub-50 px-3 py-2 text-sm text-scrub-700 ring-1 ring-scrub-200 ring-inset"
                  >
                    {saveSuccess}
                  </p>
                )}

                {saveError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200 ring-inset"
                  >
                    {saveError}
                  </p>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-white px-5 py-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={updateStockMutation.isPending}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
