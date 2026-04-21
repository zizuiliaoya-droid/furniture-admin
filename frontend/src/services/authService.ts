import api from "./api";

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "STAFF";
  display_name: string;
  is_active: boolean;
  date_joined: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>("/auth/login/", { username, password }),

  logout: () => api.post("/auth/logout/"),

  getMe: () => api.get<User>("/auth/me/"),

  getUsers: (params?: Record<string, string>) =>
    api.get<{ count: number; results: User[] }>("/auth/users/", { params }),

  createUser: (data: {
    username: string;
    password: string;
    role: string;
    display_name: string;
  }) => api.post<User>("/auth/users/", data),

  updateUser: (id: number, data: Partial<User & { password?: string }>) =>
    api.put<User>(`/auth/users/${id}/`, data),

  toggleUserStatus: (id: number) =>
    api.post<User>(`/auth/users/${id}/toggle-status/`),
};

export default authService;
