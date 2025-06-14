import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Pour accéder aux variables d'environnement

// Assurez-vous que ce chemin est correct pour vos types
import { User, AuthResponse, ApiResponse } from '../types';

// Accéder à la variable d'environnement définie dans app.json extra ou .env
const API_BASE_URL = Constants?.expoConfig?.extra?.API_BASE_URL || process.env.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fonction de connexion à l'API Laravel.
 * @param email L'email de l'utilisateur.
 * @param password Le mot de passe de l'utilisateur.
 * @returns Promise résolue avec la réponse d'authentification (user, token)
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Votre contrôleur Laravel renvoie 'user' et 'token' directement, pas 'data'
    const response = await api.post<{ user: User; token: string; message: string }>('/login', { email, password });

    // Stocker le token et les informations de l'utilisateur
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

    // Retourner au format attendu par useAuth
    return {
      user: response.data.user,
      access_token: response.data.token,
      token_type: 'Bearer', // Votre backend ne renvoie pas explicitement 'Bearer', donc nous l'ajoutons
    };
  } catch (error: any) {
    console.error('Login API Error:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
  }
};

/**
 * Fonction d'enregistrement à l'API Laravel.
 * @param name Le nom de l'utilisateur.
 * @param email L'email de l'utilisateur.
 * @param password Le mot de passe.
 * @param password_confirmation La confirmation du mot de passe.
 * @returns Promise résolue avec la réponse d'authentification (user, token)
 */
export const register = async (name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> => {
  try {
    // Votre contrôleur Laravel renvoie 'user' et 'token' directement, pas 'data'
    const response = await api.post<{ user: User; token: string; message: string }>('/register', { name, email, password, password_confirmation });

    // Stocker le token et les informations de l'utilisateur
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

    // Retourner au format attendu par useAuth
    return {
      user: response.data.user,
      access_token: response.data.token,
      token_type: 'Bearer', // Votre backend ne renvoie pas explicitement 'Bearer', donc nous l'ajoutons
    };
  } catch (error: any) {
    console.error('Register API Error:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Échec de l\'enregistrement. Veuillez réessayer.';
  }
};

/**
 * Fonction de déconnexion.
 */
export const logout = async () => {
  try {
    // Votre API de déconnexion Laravel n'a pas besoin de corps de requête si elle invalide le token actuel
    await api.post('/logout');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
  } catch (error: any) {
    console.error('Logout failed on API:', error.response?.data || error.message);
    // Même si la déconnexion échoue côté serveur, on vide le stockage local
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    throw error.response?.data?.message || 'Échec de la déconnexion.';
  }
};

/**
 * Récupère les informations de l'utilisateur depuis le stockage local.
 * @returns Les informations de l'utilisateur ou null.
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Failed to get user from storage:', error);
    return null;
  }
};

/**
 * Récupère le token d'authentification depuis le stockage local.
 * @returns Le token ou null.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Failed to get token from storage:', error);
    return null;
  }
};