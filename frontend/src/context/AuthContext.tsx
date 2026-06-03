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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const expiry = localStorage.getItem("expiry");

    if (!savedUser || !savedToken || !expiry) return;

    if (Date.now() > Number(expiry)) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("expiry");
      return;
    }

    try {
      setUser(JSON.parse(savedUser) as User);
      setToken(savedToken);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("expiry");
    }
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("expiry", expiry.toString());
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("expiry");
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const res: AxiosResponse<User> = await authService.updateProfile(data);

    const updatedUser = res.data; // 👈 هنا التصحيح الحقيقي

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