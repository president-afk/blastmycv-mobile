import { apiRequest, apiUpload } from "./api";

export interface CV {
  id: string | number;
  filename?: string;
  original_name?: string;
  originalName?: string;
  file_url?: string;
  fileUrl?: string;
  url?: string;
  status?: "pending" | "active" | "processing" | string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  size?: number;
}

export async function getCVs(): Promise<CV[]> {
  try {
    const response = await apiRequest<unknown>("/api/cvs");
    if (Array.isArray(response)) return response as CV[];
    const r = response as Record<string, unknown>;
    return ((r.data ?? r.cvs ?? r.items ?? []) as CV[]);
  } catch {
    return [];
  }
}

export async function uploadCV(
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<CV> {
  const formData = new FormData();
  formData.append("cv", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  try {
    return await apiUpload<CV>("/api/cvs", formData);
  } catch {
    return await apiUpload<CV>("/api/cv/upload", formData);
  }
}

export async function deleteCV(id: string | number): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>(`/api/cvs/${id}`, { method: "DELETE" });
  } catch {
    return await apiRequest<{ message: string }>(`/api/cv/${id}`, { method: "DELETE" });
  }
}

export async function getActiveCV(): Promise<CV | null> {
  try {
    const cvs = await getCVs();
    return cvs.find(c => c.status === "active") ?? cvs[0] ?? null;
  } catch {
    return null;
  }
}
