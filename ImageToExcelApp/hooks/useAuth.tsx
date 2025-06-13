import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { login as authLogin, register as authRegister, logout as authLogout, getUser, getToken } from '../services/authService';

interface AuthContextType {
user: User | null;
token: string | null;
isLoading: boolean;
login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserAndToken = async () => {
      try {
        const storedUser = await getUser();
        const storedToken = await getToken();
        setUser(storedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to load user or token from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserAndToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authLogin(email, password);
      setUser(authResponse.user);
      setToken(authResponse.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authRegister(name, email, password, password_confirmation);
      setUser(authResponse.user);
      setToken(authResponse.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authLogout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};