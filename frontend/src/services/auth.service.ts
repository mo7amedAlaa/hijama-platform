import api from "../api/axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/index";

export const authService = {
  async login(
    payload: LoginPayload
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/login",
      payload
    );

    return data;
  },

  async register(
    payload: RegisterPayload
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/register",
      payload
    );

    return data;
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("expiry");
  },
};