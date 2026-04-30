import { apiRequest } from "./api";

export interface Order {
  id: string | number;
  package_id?: string | number;
  packageId?: string | number;
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
  createdAt?: string;
  updated_at?: string;
  expires_at?: string;
  recruiter_blast_count?: number;
  blast_progress?: number;
}

export interface OrderStats {
  total_orders?: number;
  active_orders?: number;
  blasts_sent?: number;
  responses_received?: number;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await apiRequest<unknown>("/api/orders");
    if (Array.isArray(response)) return response as Order[];
    const r = response as Record<string, unknown>;
    return ((r.data ?? r.orders ?? r.items ?? []) as Order[]);
  } catch {
    return [];
  }
}

export async function getOrder(id: string | number): Promise<Order> {
  return apiRequest<Order>(`/api/orders/${id}`);
}

export async function getDashboardStats(): Promise<OrderStats> {
  try {
    const orders = await getOrders();
    return {
      total_orders: orders.length,
      active_orders: orders.filter(o => o.status === "active" || o.status === "processing").length,
      blasts_sent: orders.reduce((sum, o) => sum + (o.recruiter_blast_count ?? 0), 0),
      responses_received: 0,
    };
  } catch {
    return { total_orders: 0, active_orders: 0, blasts_sent: 0, responses_received: 0 };
  }
}
