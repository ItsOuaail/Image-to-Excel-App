import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8000';

// Axios instance for API requests
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // ✅ Nécessaire pour les cookies Laravel (dont CSRF)
});

// Obtenir le token CSRF (à appeler avant tout POST/PUT/DELETE non authentifié)
export const getCsrfToken = async () => {
  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true, // ✅ Essentiel pour que le cookie XSRF-TOKEN soit reçu
  });
};

// Intercepteur pour ajouter le token Bearer si présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 422) {
      console.log('Validation errors:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
