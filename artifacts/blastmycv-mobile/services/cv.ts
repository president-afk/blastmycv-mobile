import { apiRequest, apiUpload } from "./api";

export interface CV {
  id: string | number;
  filename?: string;
  original_name?: string;
  file_url?: string;
  url?: string;
  status?: "pending" | "active" | "processing" | string;
  created_at?: string;
  updated_at?: string;
  size?: number;
}

export interface CVListResponse {
  data?: CV[];
  cvs?: CV[];
  items?: CV[];
}

export async function getCVs(): Promise<CV[]> {
  const response = await apiRequest<CVListResponse | CV[]>("/api/cv");
  if (Array.isArray(response)) return response;
  return response.data ?? response.cvs ?? response.items ?? [];
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

  return apiUpload<CV>("/api/cv/upload", formData);
}

export async function deleteCV(id: string | number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/cv/${id}`, {
    method: "DELETE",
  });
}

export async function getActiveCV(): Promise<CV | null> {
  try {
    return await apiRequest<CV>("/api/cv/active");
  } catch {
    return null;
  }
}
