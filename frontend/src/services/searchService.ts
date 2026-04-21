import api from "./api";

export interface SearchResults {
  products: { id: number; name: string; code: string | null }[];
  cases: { id: number; title: string }[];
  documents: { id: number; name: string }[];
  quotes: { id: number; title: string; customer_name: string }[];
}

const searchService = {
  search: (q: string) => api.get<SearchResults>("/search/", { params: { q } }),
};

export default searchService;
