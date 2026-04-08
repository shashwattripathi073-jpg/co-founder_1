"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("cofounder_token");
    const savedUser = localStorage.getItem("cofounder_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/user/login`, { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("cofounder_token", newToken);
    localStorage.setItem("cofounder_user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    return userData;
  };

  const register = async (data) => {
    const res = await axios.post(`${API}/user/register`, data);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("cofounder_token", newToken);
    localStorage.setItem("cofounder_user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("cofounder_token");
    localStorage.removeItem("cofounder_user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API}/user/me`);
      setUser(res.data);
      localStorage.setItem("cofounder_user", JSON.stringify(res.data));
    } catch {
      logout();
    }
  };

  const updateProfile = async (profileData) => {
    const res = await axios.put(`${API}/user/profile`, profileData);
    setUser(res.data);
    localStorage.setItem("cofounder_user", JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      refreshUser, updateProfile,
      isLoggedIn: !!token,
      isAdmin: user?.isAdmin || false,
      API
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export default AuthContext;
