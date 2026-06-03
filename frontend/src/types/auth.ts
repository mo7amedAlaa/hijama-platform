export type User = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin" | string;
  age?: number;
  weight?: number | null;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin" | string;
  age?: number;
  weight?: number | null;
};