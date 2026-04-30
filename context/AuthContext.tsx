import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  LoginCredentials,
  RegisterData,
  User,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "@/services/auth";
import { getSessionId, clearSession } from "@/services/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const [sessionId, storedUser] = await Promise.all([
          getSessionId(),
          AsyncStorage.getItem("auth_user"),
        ]);
        if (sessionId && storedUser) {
          setUserState(JSON.parse(storedUser));
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const userData = await apiLogin(credentials);
    await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
    setUserState(userData);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const userData = await apiRegister(data);
    await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
    setUserState(userData);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    await AsyncStorage.removeItem("auth_user");
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    AsyncStorage.setItem("auth_user", JSON.stringify(u)).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
