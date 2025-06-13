import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User } from '../types';
import Constants from 'expo-constants'; // To access .env variables safely

const API_BASE_URL = Constants?.expoConfig?.extra?.API_BASE_URL || process.env.API_BASE_URL;

const api = axios.create({
baseURL: API_BASE_URL,
headers: {
'Content-Type': 'application/json',
'Accept': 'application/json',
},
});

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

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/login', { email, password });
    await AsyncStorage.setItem('userToken', response.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const register = async (name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/register', { name, email, password, password_confirmation });
    await AsyncStorage.setItem('userToken', response.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

export const logout = async () => {
  try {
    await api.post('/logout');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
  } catch (error: any) {
    console.error('Logout failed:', error.response?.data?.message || error.message);
    // Even if logout fails on server, clear local storage
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from storage:', error);
    return null;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Failed to get token from storage:', error);
    return null;
  }
};