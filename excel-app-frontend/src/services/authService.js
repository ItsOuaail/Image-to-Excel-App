import api from '../config/api';

const getCsrfToken = async () => {
  await api.get('/sanctum/csrf-cookie'); // Laravel Sanctum CSRF
};

export const authService = {
  // Login user
  login: async (email, password) => {
    // 💡 Nécessaire avant login
    const response = await api.post('/login', {
      email,
      password,
    });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    await getCsrfToken(); // 💡 Nécessaire avant register
    const response = await api.post('/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password_confirmation,
    });
    console.log('Register response:', response.data);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    await getCsrfToken(); // 💡 Nécessaire si ce endpoint l’exige
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, email, password, passwordConfirmation) => {
    await getCsrfToken(); // 💡 Idem ici si Sanctum protège ce route
    const response = await api.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },
};
