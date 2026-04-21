import api from "./api";
import type { PaginatedResponse } from "./productService";

export interface CaseItem {
  id: number;
  title: string;
  description: string;
  industry: string;
  industry_display: string;
  cover_image?: { image_path: string; thumbnail_path: string } | null;
  product_ids?: number[];
  images?: { id: number; image_path: string; thumbnail_path: string; is_cover: boolean }[];
  created_by_name: string;
  created_at: string;
}

const caseService = {
  getCases: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<CaseItem>>("/cases/", { params }),
  getCase: (id: number) => api.get<CaseItem>(`/cases/${id}/`),
  createCase: (data: Record<string, unknown>) => api.post<CaseItem>("/cases/", data),
  updateCase: (id: number, data: Record<string, unknown>) => api.patch<CaseItem>(`/cases/${id}/`, data),
  deleteCase: (id: number) => api.delete(`/cases/${id}/`),
  uploadImages: (caseId: number, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return api.post(`/cases/${caseId}/upload_images/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  deleteImage: (imageId: number) => api.delete(`/cases/images/${imageId}/`),
};

export default caseService;
