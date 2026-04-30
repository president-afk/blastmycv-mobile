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

export interface NotificationListResponse {
  data?: Notification[];
  notifications?: Notification[];
  items?: Notification[];
  unread_count?: number;
}

export async function getNotifications(): Promise<{
  notifications: Notification[];
  unread_count: number;
}> {
  const response = await apiRequest<NotificationListResponse | Notification[]>(
    "/api/notifications",
  );
  if (Array.isArray(response)) {
    return {
      notifications: response,
      unread_count: response.filter((n) => !n.is_read && !n.read).length,
    };
  }
  const notifications =
    response.data ?? response.notifications ?? response.items ?? [];
  const unread_count =
    response.unread_count ??
    notifications.filter((n) => !n.is_read && !n.read).length;
  return { notifications, unread_count };
}

export async function markNotificationRead(
  id: string | number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/notifications/read-all", {
    method: "POST",
  });
}
