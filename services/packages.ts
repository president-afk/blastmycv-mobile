import { apiRequest } from "./api";

export interface Package {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  duration_days?: number;
  applications_limit?: number;
  features?: string[];
  is_popular?: boolean;
  badge?: string;
}

export interface PackageListResponse {
  data?: Package[];
  packages?: Package[];
  items?: Package[];
}

export interface PurchaseData {
  package_id: string | number;
  payment_method?: string;
  payment_token?: string;
}

export interface PurchaseResponse {
  order_id?: string | number;
  id?: string | number;
  status?: string;
  message?: string;
  checkout_url?: string;
  payment_url?: string;
}

export async function getPackages(): Promise<Package[]> {
  const response = await apiRequest<PackageListResponse | Package[]>("/api/packages");
  if (Array.isArray(response)) return response;
  return response.data ?? response.packages ?? response.items ?? [];
}

export async function getPackage(id: string | number): Promise<Package> {
  return apiRequest<Package>(`/api/packages/${id}`);
}

export async function purchasePackage(data: PurchaseData): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/api/orders", {
    method: "POST",
    body: data,
  });
}
