// Owner: Anmol (code-by-anmol) - logic & integration
import client from './client';

export const getMoves = (params = {}) => client.get('/moves', { params }).then((r) => r.data);
