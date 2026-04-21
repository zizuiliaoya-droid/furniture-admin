import api from "./api";

export interface Category {
  id: number;
  name: string;
  parent: number | null;
  dimension: "TYPE" | "SPACE" | "ORIGIN";
  sort_order: number;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  image_path: string;
  thumbnail_path: string;
  sort_order: number;
  is_cover: boolean;
}

export interface ProductConfig {
  id: number;
  config_name: string;
  attributes: Record<string, string>;
  guide_price: number | null;
}

export interface Product {
  id: number;
  name: string;
  code: string | null;
  description: string;
  origin: "IMPORT" | "DOMESTIC" | "CUSTOM";
  min_price: number | null;
  is_active: boolean;
  category: number | null;
  category_name: string;
  category_ids?: number[];
  cover_image?: { image_path: string; thumbnail_path: string } | null;
  images?: ProductImage[];
  configs?: ProductConfig[];
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const productService = {
  // Products
  getProducts: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Product>>("/products/", { params }),

  getProduct: (id: number) =>
    api.get<Product>(`/products/${id}/`),

  createProduct: (data: Record<string, unknown>) =>
    api.post<Product>("/products/", data),

  updateProduct: (id: number, data: Record<string, unknown>) =>
    api.patch<Product>(`/products/${id}/`, data),

  deleteProduct: (id: number) =>
    api.delete(`/products/${id}/`),

  uploadImages: (productId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    return api.post(`/products/${productId}/upload_images/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (imageId: number) =>
    api.delete(`/products/images/${imageId}/`),

  setCoverImage: (imageId: number) =>
    api.put(`/products/images/${imageId}/cover/`),

  updateImageOrder: (productId: number, data: { id: number; sort_order: number }[]) =>
    api.put(`/products/${productId}/images/order/`, data),

  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/products/import/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Categories
  getCategories: (params?: Record<string, string>) =>
    api.get<Category[]>("/categories/", { params }),

  getCategoryTree: (dimension: string) =>
    api.get<Category[]>("/categories/tree/", { params: { dimension } }),

  createCategory: (data: Partial<Category>) =>
    api.post<Category>("/categories/", data),

  updateCategory: (id: number, data: Partial<Category>) =>
    api.patch<Category>(`/categories/${id}/`, data),

  deleteCategory: (id: number) =>
    api.delete(`/categories/${id}/`),

  reorderCategories: (data: { id: number; sort_order: number }[]) =>
    api.put("/categories/reorder/", data),

  // Configs
  getConfigs: (productId: number) =>
    api.get<ProductConfig[]>(`/products/${productId}/configs/`),

  createConfig: (productId: number, data: Partial<ProductConfig>) =>
    api.post<ProductConfig>(`/products/${productId}/configs/`, data),

  updateConfig: (configId: number, data: Partial<ProductConfig>) =>
    api.put<ProductConfig>(`/products/configs/${configId}/`, data),

  deleteConfig: (configId: number) =>
    api.delete(`/products/configs/${configId}/`),
};

export default productService;
