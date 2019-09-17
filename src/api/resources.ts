import axios from 'axios';

export interface IResourceResult {
  id: string;
  title: string;
  icon?: string;
  uri: string;
}

export interface ICategory {
  id: string;
  name: string;
  icon: string;
}

const getResources = (query: string): Promise<IResourceResult[]> =>
  axios.get(`/api/resources${query ? `?query=${query}` : ''}`).then(res => res.data);

const getResourcesByCategory = (categoryId: string): Promise<IResourceResult[]> =>
  axios
    .get(`/api/resources${categoryId !== 'all' ? `?category=${categoryId}` : ''}`)
    .then(res => res.data);

const getResourcesByQueue = (category: string): Promise<IResourceResult[]> =>
  axios.get(`/api/resources/category/${category}`).then(res => res.data);

const getCategories = (): Promise<ICategory[]> =>
  axios.get('/api/resources/categories').then(res => res.data);

// Category selected by default. Currently the 'popular' category id
const defaultCategoryId = '1b9b7a4b-5a64-41af-a40a-8bb01abedd19';

export {
  getResources,
  getResourcesByCategory,
  getResourcesByQueue,
  getCategories,
  defaultCategoryId
};