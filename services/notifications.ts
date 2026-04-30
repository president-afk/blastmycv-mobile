import { apiRequest } from "./api";

export interface Notification {
  id: string | number;
  title?: string;
  message?: string;
  body?: string;
  type?: "order" | "blast" | "response" | "system" | string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
  data?: Record<string, unknown>;
}

export async function getNotifications(): Promise<{
  notifications: Notification[];
  unread_count: number;
}> {
  try {
    const response = await apiRequest<unknown>("/api/notifications");
    if (Array.isArray(response)) {
      const list = response as Notification[];
      return { notifications: list, unread_count: list.filter(n => !n.is_read && !n.read).length };
    }
    const r = response as Record<string, unknown>;
    const notifications = ((r.data ?? r.notifications ?? r.items ?? []) as Notification[]);
    const unread_count = (r.unread_count as number) ?? notifications.filter(n => !n.is_read && !n.read).length;
    return { notifications, unread_count };
  } catch {
    return { notifications: [], unread_count: 0 };
  }
}

export async function markNotificationRead(id: string | number): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>(`/api/notifications/${id}/read`, { method: "POST" });
  } catch {
    return { message: "ok" };
  }
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>("/api/notifications/read-all", { method: "POST" });
  } catch {
    return { message: "ok" };
  }
}
