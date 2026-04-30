import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://blastmycv.com";

const SESSION_KEY = "session_id";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

export async function saveSessionId(sessionId: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, sessionId);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

function extractSessionFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/PHPSESSID=([^;]+)/);
  return match ? match[1] : null;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  if (!skipAuth) {
    const sessionId = await getSessionId();
    if (sessionId) {
      requestHeaders["Cookie"] = `PHPSESSID=${sessionId}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const newSession = extractSessionFromCookies(setCookie);
    if (newSession) {
      await saveSessionId(newSession);
    }
  }

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as Record<string, unknown>).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const sessionId = await getSessionId();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (sessionId) {
    headers["Cookie"] = `PHPSESSID=${sessionId}`;
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const newSession = extractSessionFromCookies(setCookie);
    if (newSession) {
      await saveSessionId(newSession);
    }
  }

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as Record<string, unknown>).message)
        : `Upload failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}
