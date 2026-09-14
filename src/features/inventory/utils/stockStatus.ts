const LOW_STOCK_THRESHOLD = 10;

export interface StockStatus {
  label: string;
  className: string;
}

export const getStockStatus = (stock: number): StockStatus => {
  if (stock <= 0) {
    return {
      label: 'Out of stock',
      className: 'bg-rose-50 text-rose-700 ring-rose-200',
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: `Low stock · ${stock}`,
      className: 'bg-amber-50 text-amber-800 ring-amber-200',
    };
  }

  return {
    label: `In stock · ${stock}`,
    className: 'bg-scrub-50 text-scrub-700 ring-scrub-200',
  };
};
