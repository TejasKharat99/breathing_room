import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setUser(decoded);
      } catch (e) {
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
