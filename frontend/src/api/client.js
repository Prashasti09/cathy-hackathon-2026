// Owner: Anmol (code-by-anmol) - logic & integration
// Base setup for talking to the backend. Adds the login token to every request
// and sends the user back to the login page if the session has expired.
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.startsWith('/auth/')) {
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Turns any request error into a readable message for the screen.
export function errorMessage(err) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.request && !err.response) return 'Cannot reach the server. Is the backend running?';
  return 'Something went wrong';
}

export default client;
