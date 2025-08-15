import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../types/index';
import apiService from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  admin: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  loginAdmin: (admin: any, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [admin, setAdmin] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (user: AuthUser, token: string) => {
    apiService.setAuthToken(token);
    apiService.setUser(user);
    setUser(user);
    setAdmin(null); // Limpiar admin al hacer login de político
  };

  const loginAdmin = (adminData: any, token: string) => {
    console.log('AuthContext - loginAdmin ejecutándose con:', adminData);
    apiService.setAuthToken(token);
    apiService.setUser(adminData); // Guardar admin como user para compatibilidad
    setAdmin(adminData);
    setUser(null); // Limpiar user al hacer login de admin
    console.log('AuthContext - Admin establecido en contexto');
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setAdmin(null);
  };

  const checkAuth = () => {
    const token = apiService.getAuthToken();
    const storedUser = apiService.getUser();
    
    console.log('AuthContext - checkAuth ejecutándose');
    console.log('AuthContext - Token:', !!token);
    console.log('AuthContext - StoredUser:', storedUser);
    
    if (token && storedUser) {
      // Verificar si es admin o político
      if (storedUser.type === 'admin') {
        console.log('AuthContext - Usuario es admin');
        setAdmin(storedUser);
        setUser(null);
      } else {
        console.log('AuthContext - Usuario es político');
        setUser(storedUser);
        setAdmin(null);
      }
    } else {
      console.log('AuthContext - No hay usuario o token, limpiando contexto');
      setUser(null);
      setAdmin(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    admin,
    isAuthenticated: !!(user || admin),
    isAdmin: !!admin,
    isLoading,
    login,
    loginAdmin,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
