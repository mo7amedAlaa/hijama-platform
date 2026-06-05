import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { User } from "../types/index";
import { authService } from "../services/api";
import type { AxiosResponse } from "axios";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  isAuth: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── INIT AUTH ─────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const expiry = localStorage.getItem("expiry");

    if (!savedUser || !savedToken || !expiry) {
      setLoading(false);
      return;
    }

    if (Date.now() > Number(expiry)) {
      localStorage.clear();
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── LOGIN ─────────────────────────────
  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("expiry", expiry.toString());
  };

  // ─── LOGOUT ─────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  // ─── UPDATE PROFILE ─────────────────────────
  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const res: AxiosResponse<Partial<User>> =
      await authService.updateProfile(data);

    const updatedUser = {
      ...(user as User),
      ...res.data,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  };

  const isAuth = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateProfile,
        isAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};