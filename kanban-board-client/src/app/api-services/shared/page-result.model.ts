export interface PageResultApi<T> {
  items: T[];
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  includedTotal: boolean;
}