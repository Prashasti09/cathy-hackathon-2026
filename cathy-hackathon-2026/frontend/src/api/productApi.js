// Owner: Anmol (code-by-anmol) - logic & integration
import client from './client';

export const getProducts = (params = {}) => client.get('/products', { params }).then((r) => r.data);
export const getProduct = (id) => client.get(`/products/${id}`).then((r) => r.data);
export const createProduct = (data) => client.post('/products', data).then((r) => r.data);
export const updateProduct = (id, data) => client.put(`/products/${id}`, data).then((r) => r.data);
// Stock page "update stock": sets the quantity at one location (saved as an adjustment).
export const setStock = (id, locationId, quantity) =>
  client.post(`/products/${id}/stock`, { locationId, quantity }).then((r) => r.data);
export const getCategories = () => client.get('/products/categories').then((r) => r.data);
export const createCategory = (name) => client.post('/products/categories', { name }).then((r) => r.data);
