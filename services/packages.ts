import { apiRequest } from "./api";

export interface Package {
  id: string | number;
  name: string;
  description?: string;
  price: number | string;
  currency?: string;
  duration_days?: number;
  applications_limit?: number;
  features?: string[];
  is_popular?: boolean;
  badge?: string;
  employersReached?: string;
  countries?: string[];
}

function normalizePackage(raw: Record<string, unknown>): Package {
  return {
    id: raw.id as string | number,
    name: raw.name as string,
    description: raw.description as string | undefined,
    price: raw.price as number | string,
    currency: (raw.currency as string) ?? "USD",
    duration_days: raw.duration_days as number | undefined,
    applications_limit: raw.applications_limit as number | undefined,
    features: raw.features as string[] | undefined,
    is_popular: ((raw.is_popular ?? raw.isPopular) as boolean) ?? false,
    badge: raw.badge as string | undefined,
    employersReached: raw.employersReached as string | undefined,
    countries: raw.countries as string[] | undefined,
  };
}

export interface PurchaseData {
  package_id: string | number;
  payment_method?: string;
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
  const response = await apiRequest<unknown>("/api/packages");
  if (Array.isArray(response)) {
    return (response as Record<string, unknown>[]).map(normalizePackage);
  }
  const res = response as Record<string, unknown>;
  const arr = (res.data ?? res.packages ?? res.items ?? []) as Record<string, unknown>[];
  return arr.map(normalizePackage);
}

export async function purchasePackage(data: PurchaseData): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/api/orders", {
    method: "POST",
    body: { package_id: data.package_id },
  });
}
