// Owner: Anmol (code-by-anmol) - logic & integration
// Warehouses and their locations (Settings pages).
import client from './client';

export const getWarehouses = () => client.get('/warehouses').then((r) => r.data);
export const createWarehouse = (data) => client.post('/warehouses', data).then((r) => r.data);
export const updateWarehouse = (id, data) => client.put(`/warehouses/${id}`, data).then((r) => r.data);

export const getLocations = (warehouseId) =>
  client.get('/locations', { params: warehouseId ? { warehouseId } : {} }).then((r) => r.data);
export const createLocation = (data) => client.post('/locations', data).then((r) => r.data);
export const updateLocation = (id, data) => client.put(`/locations/${id}`, data).then((r) => r.data);
