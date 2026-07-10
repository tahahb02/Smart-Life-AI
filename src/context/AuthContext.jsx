import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password, rememberMe) => {
    const { data } = await authAPI.login({ email, password, rememberMe });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const verifyOTP = async (code) => {
    const { data } = await authAPI.verifyOTP({ code, userId: user?._id });
    setUser((prev) => ({ ...prev, isVerified: true }));
    return data;
  };

  const resendOTP = async () => {
    const { data } = await authAPI.resendOTP();
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, login, register, logout, verifyOTP, resendOTP, loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
