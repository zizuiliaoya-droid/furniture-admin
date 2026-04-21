import { create } from "zustand";
import authService, { type User } from "../services/authService";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authService.login(username, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("登录失败");
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await authService.getMe();
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data, token });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null });
    }
  },
}));

export default useAuthStore;
