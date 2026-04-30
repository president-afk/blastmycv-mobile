import { apiRequest, saveSessionId, clearSession } from "./api";

export interface User {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  nationality?: string;
  currentLocation?: string;
  jobTitle?: string;
  yearsExperience?: number | null;
  preferredIndustry?: string | null;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: "candidate" | "recruiter" | "user";
  phone?: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`https://blastmycv.com/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/PHPSESSID=([^;]+)/);
    if (match) await saveSessionId(match[1]);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Login failed");
  }
  return data as User;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await fetch(`https://blastmycv.com/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/PHPSESSID=([^;]+)/);
    if (match) await saveSessionId(match[1]);
  }

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message ?? "Registration failed");
  }

  if (!json.id) {
    throw new Error(json.message ?? "Registration failed");
  }

  const loginResult = await login({ email: data.email, password: data.password });
  return loginResult;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
  } finally {
    await clearSession();
  }
}

export async function getProfile(): Promise<User> {
  return apiRequest<User>("/api/auth/me");
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return apiRequest<User>("/api/auth/profile", {
    method: "PUT",
    body: data,
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    body: data,
  });
}
