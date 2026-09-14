import api from '../../../lib/axios';

export const getCategories = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/products/category-list');

  return response.data;
};
