import api from "./api";
import type { PaginatedResponse } from "./productService";

export interface DocFolder {
  id: number;
  name: string;
  doc_type: string;
  parent: number | null;
  sort_order: number;
  children?: DocFolder[];
}

export interface DocItem {
  id: number;
  name: string;
  doc_type: string;
  folder: number | null;
  folder_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  tags: string[];
  created_by_name: string;
  created_at: string;
}

const documentService = {
  getDocuments: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<DocItem>>("/documents/", { params }),
  uploadDocument: (data: FormData) =>
    api.post<DocItem>("/documents/upload/", data, { headers: { "Content-Type": "multipart/form-data" } }),
  downloadDocument: (id: number) =>
    api.get(`/documents/${id}/download/`, { responseType: "blob" }),
  deleteDocument: (id: number) => api.delete(`/documents/${id}/`),
  updateTags: (id: number, tags: string[]) => api.patch(`/documents/${id}/`, { tags }),
  getFolders: (params?: Record<string, string>) =>
    api.get<DocFolder[]>("/document-folders/", { params }),
  getFolderTree: (docType: string) =>
    api.get<DocFolder[]>("/document-folders/tree/", { params: { doc_type: docType } }),
  createFolder: (data: Partial<DocFolder>) => api.post<DocFolder>("/document-folders/", data),
  deleteFolder: (id: number) => api.delete(`/document-folders/${id}/`),
};

export default documentService;
