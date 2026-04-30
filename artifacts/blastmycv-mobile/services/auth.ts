import { apiRequest } from "./api";

export interface User {
  id: string | number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: "candidate" | "recruiter" | "admin" | string;
  phone?: string;
  avatar?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: "candidate" | "recruiter";
  phone?: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: data,
    skipAuth: true,
  });
}

export async function getProfile(): Promise<User> {
  return apiRequest<User>("/api/auth/profile");
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return apiRequest<User>("/api/auth/profile", {
    method: "PUT",
    body: data,
  });
}

export async function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    body: data,
  });
}
