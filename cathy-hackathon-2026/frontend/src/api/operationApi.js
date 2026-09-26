// Owner: Anmol (code-by-anmol) - logic & integration
// Receipts (IN), deliveries (OUT), transfers (INT), adjustments (ADJ).
import client from './client';

export const getOperations = (params = {}) => client.get('/operations', { params }).then((r) => r.data);
export const getOperation = (id) => client.get(`/operations/${id}`).then((r) => r.data);
export const createOperation = (data) => client.post('/operations', data).then((r) => r.data);
export const updateOperation = (id, data) => client.put(`/operations/${id}`, data).then((r) => r.data);
export const markTodo = (id) => client.post(`/operations/${id}/todo`).then((r) => r.data);
export const validateOperation = (id) => client.post(`/operations/${id}/validate`).then((r) => r.data);
export const cancelOperation = (id) => client.post(`/operations/${id}/cancel`).then((r) => r.data);
