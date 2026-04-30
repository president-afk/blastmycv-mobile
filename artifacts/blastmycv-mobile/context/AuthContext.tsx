import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  login as apiLogin,
  register as apiRegister,
} from "@/services/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("auth_token"),
          AsyncStorage.getItem("auth_user"),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response: AuthResponse = await apiLogin(credentials);
    await Promise.all([
      AsyncStorage.setItem("auth_token", response.token),
      AsyncStorage.setItem("auth_user", JSON.stringify(response.user)),
    ]);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response: AuthResponse = await apiRegister(data);
    await Promise.all([
      AsyncStorage.setItem("auth_token", response.token),
      AsyncStorage.setItem("auth_user", JSON.stringify(response.user)),
    ]);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem("auth_token"),
      AsyncStorage.removeItem("auth_user"),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    AsyncStorage.setItem("auth_user", JSON.stringify(u)).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        setUser: updateUser,
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
