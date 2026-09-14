import api from '../../../lib/axios';
import type { Product, ProductsResponse } from './products.types';

interface GetProductsParams {
  limit: number;
  skip: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  signal?: AbortSignal;
}

export const getProducts = async ({
  limit,
  skip,
  search,
  category,
  sortBy,
  order,
  signal,
}: GetProductsParams): Promise<ProductsResponse> => {
  let endpoint = '/products';

  if (search) {
    endpoint = '/products/search';
  } else if (category) {
    endpoint = `/products/category/${category}`;
  }

  const response = await api.get<ProductsResponse>(endpoint, {
    signal,
    params: {
      limit,
      skip,
      ...(search ? { q: search } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(order ? { order } : {}),
    },
  });

  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
};

export const updateProductStock = async (id: number, stock: number): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, {
    stock,
  });

  return response.data;
};
