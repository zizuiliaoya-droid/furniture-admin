import api from "./api";

export interface ShareLink {
  id: number;
  token: string;
  content_type: string;
  object_id: number | null;
  title: string;
  has_password: boolean;
  expires_at: string | null;
  max_access_count: number | null;
  access_count: number;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
}

const shareService = {
  getShares: () => api.get<{ count: number; results: ShareLink[] }>("/shares/"),
  createShare: (data: Record<string, unknown>) => api.post<ShareLink>("/shares/", data),
  deleteShare: (id: number) => api.delete(`/shares/${id}/`),
  getPublicShare: (token: string) => api.get(`/share/${token}/`),
  verifyShare: (token: string, password?: string) =>
    api.post(`/share/${token}/verify/`, { password: password || "" }),
};

export default shareService;
