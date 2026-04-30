import { apiRequest } from "./api";

export interface Order {
  id: string | number;
  package_id?: string | number;
  package?: {
    id: string | number;
    name: string;
    price?: number;
  };
  status: "pending" | "active" | "completed" | "cancelled" | "processing" | string;
  amount?: number;
  price?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
  recruiter_blast_count?: number;
  blast_progress?: number;
}

export interface OrderListResponse {
  data?: Order[];
  orders?: Order[];
  items?: Order[];
}

export interface OrderStats {
  total_orders?: number;
  active_orders?: number;
  blasts_sent?: number;
  responses_received?: number;
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiRequest<OrderListResponse | Order[]>("/api/orders");
  if (Array.isArray(response)) return response;
  return response.data ?? response.orders ?? response.items ?? [];
}

export async function getOrder(id: string | number): Promise<Order> {
  return apiRequest<Order>(`/api/orders/${id}`);
}

export async function getOrderStats(): Promise<OrderStats> {
  try {
    return await apiRequest<OrderStats>("/api/orders/stats");
  } catch {
    return {};
  }
}

export async function getDashboardStats(): Promise<OrderStats> {
  try {
    return await apiRequest<OrderStats>("/api/dashboard/stats");
  } catch {
    return getOrderStats();
  }
}
