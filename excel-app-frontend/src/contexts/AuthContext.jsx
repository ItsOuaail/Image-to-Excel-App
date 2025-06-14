import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (token) {
        // Fetch user profile using the token
        const response = await fetch('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
  try {
    // 1. Get CSRF cookie from Sanctum (with credentials)
    await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      credentials: 'include', // Essential for cookies
    });

    // 2. Perform login (with credentials)
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Essential for cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // 3. Store token and user data
    Cookies.set('auth_token', data.token, { expires: 1 });
    setUser(data.user);
    setIsAuthenticated(true);
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed. Please try again.' 
    };
  }
};

  const register = async (userData) => {
  try {
    // 1. Get CSRF cookie
    await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      credentials: 'include',
    });

    // 2. Send registration request
    const response = await fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // 3. Automatically log user in after registration
    const loginResponse = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      throw new Error(loginData.message || 'Auto-login failed');
    }

    // 4. Store token and set user
    Cookies.set('auth_token', loginData.token, { expires: 1 });
    setUser(loginData.user);
    setIsAuthenticated(true);
    
    return { success: true, data: loginData.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      error: error.message || 'Registration failed. Please try again.' 
    };
  }
};

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};