import { useMemo, useState } from 'react';

export interface UsePaginationOptions<T> {
  data: T[];
  pageSize?: number;
  initialPage?: number; // zero-based for UI convenience
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
}

export interface UsePaginationReturn<T> {
  page: number; // zero-based
  rowsPerPage: number;
  totalCount: number;
  totalPages: number;
  sortedData: T[];
  paginatedData: T[];
  sortBy?: keyof T;
  sortOrder: 'asc' | 'desc';
  setPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
  setSort: (field: keyof T) => void;
}

export function usePagination<T>(options: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const {
    data,
    pageSize = 20,
    initialPage = 0,
    sortBy,
    sortOrder = 'asc',
  } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [currentSortBy, setCurrentSortBy] = useState<keyof T | undefined>(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(sortOrder);

  const sortedData = useMemo(() => {
    if (!currentSortBy) return data;
    const cloned = [...data];
    cloned.sort((a, b) => {
      const aValue = a[currentSortBy as keyof T] as unknown as string | number | undefined;
      const bValue = b[currentSortBy as keyof T] as unknown as string | number | undefined;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return currentSortOrder === 'desc' ? -comparison : comparison;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return currentSortOrder === 'desc' ? -comparison : comparison;
      }
      return 0;
    });
    return cloned;
  }, [data, currentSortBy, currentSortOrder]);

  const totalCount = sortedData.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const setSort = (field: keyof T) => {
    if (currentSortBy === field) {
      setCurrentSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCurrentSortBy(field);
      setCurrentSortOrder('asc');
    }
  };

  return {
    page,
    rowsPerPage,
    totalCount,
    totalPages,
    sortedData,
    paginatedData,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
    setPage,
    setRowsPerPage,
    setSort,
  };
}



