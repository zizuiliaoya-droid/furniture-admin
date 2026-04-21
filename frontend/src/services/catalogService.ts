import api from "./api";
import type { Product, PaginatedResponse } from "./productService";

const catalogService = {
  browse: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Product>>("/catalog/", { params }),

  search: (q: string) =>
    api.get<PaginatedResponse<Product>>("/catalog/search/", { params: { q } }),
};

export default catalogService;
