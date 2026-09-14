import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductStock } from '../api/productsApi';
import type { Product, ProductsResponse } from '../api/products.types';

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => updateProductStock(id, stock),

    onSuccess: (updatedProduct: Product) => {
      // Update the individual product cache
      queryClient.setQueryData<Product>(['product', updatedProduct.id], updatedProduct);

      // Update every cached products list
      queryClient.setQueriesData<ProductsResponse>({ queryKey: ['products'] }, (oldData) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          products: oldData.products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
        };
      });
    },
  });
};
