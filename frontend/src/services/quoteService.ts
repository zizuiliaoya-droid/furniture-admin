import api from "./api";
import type { PaginatedResponse } from "./productService";

export interface QuoteItem {
  id: number;
  product: number | null;
  product_name: string;
  config_name: string;
  unit_price: number;
  quantity: number;
  discount: number;
  subtotal: number;
  sort_order: number;
}

export interface Quote {
  id: number;
  title: string;
  customer_name: string;
  status: string;
  status_display: string;
  notes: string;
  terms: string;
  total_amount: number;
  items?: QuoteItem[];
  item_count?: number;
  created_by_name: string;
  created_at: string;
}

const quoteService = {
  getQuotes: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Quote>>("/quotes/", { params }),
  getQuote: (id: number) => api.get<Quote>(`/quotes/${id}/`),
  createQuote: (data: Record<string, unknown>) => api.post<Quote>("/quotes/", data),
  updateQuote: (id: number, data: Record<string, unknown>) => api.patch<Quote>(`/quotes/${id}/`, data),
  deleteQuote: (id: number) => api.delete(`/quotes/${id}/`),
  duplicateQuote: (id: number) => api.post<Quote>(`/quotes/${id}/duplicate/`),
  exportPDF: (id: number) => api.get(`/quotes/${id}/pdf/`, { responseType: "blob" }),
  getItems: (quoteId: number) => api.get<QuoteItem[]>(`/quotes/${quoteId}/items/`),
  addItem: (quoteId: number, data: Partial<QuoteItem>) => api.post<QuoteItem>(`/quotes/${quoteId}/items/`, data),
  updateItem: (itemId: number, data: Partial<QuoteItem>) => api.put<QuoteItem>(`/quotes/items/${itemId}/`, data),
  deleteItem: (itemId: number) => api.delete(`/quotes/items/${itemId}/`),
};

export default quoteService;
