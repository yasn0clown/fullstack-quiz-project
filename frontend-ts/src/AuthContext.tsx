import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/profile').then(response => {
        setIsAuthenticated(true);
        setUsername(response.data.username);
      }).catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUsername(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);