import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock login - in real app, verify credentials with backend
    const mockUser = {
      id: 1,
      email,
      name: email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    
    setUser(mockUser);
    toast.success('Successfully logged in!');
  };

  const signup = async (email, password, name) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock signup - in real app, create user in backend
    const mockUser = {
      id: Date.now(),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    
    setUser(mockUser);
    toast.success('Account created successfully!');
  };

  const logout = () => {
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated: !!user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
