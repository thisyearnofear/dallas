/**
 * usePagination Hook - Paginated Data Loading
 * 
 * Features:
 * - Configurable page size
 * - Cursor-based pagination support
 * - Prefetching next page
 * - Loading states
 * 
 * Core Principles:
 * - PERFORMANT: Efficient data loading
 * - CLEAN: Clear pagination state management
 * - MODULAR: Works with any data source
 */

import { useState, useCallback, useEffect, useRef } from 'preact/hooks';

// ============= Types =============

interface PaginationState<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

interface UsePaginationOptions {
  perPage?: number;
  initialPage?: number;
  prefetchNext?: boolean;
}

interface UsePaginationReturn<T> extends PaginationState<T> {
  // Actions
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Setters
  setPerPage: (perPage: number) => void;
  
  // Utilities
  getPageData: () => T[];
  getTotalPages: () => number;
}

type FetchFunction<T> = (page: number, perPage: number) => Promise<{
  data: T[];
  total: number;
  hasMore: boolean;
}>;

// ============= Hook =============

export function usePagination<T>(
  fetchFunction: FetchFunction<T>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    perPage: initialPerPage = 10,
    initialPage = 1,
    prefetchNext = true,
  } = options;

  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    page: initialPage,
    perPage: initialPerPage,
    total: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch data for a specific page
  const fetchData = useCallback(async (
    page: number,
    perPage: number,
    isLoadingMore = false
  ): Promise<void> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: !isLoadingMore,
      isLoadingMore,
      error: null,
    }));

    try {
      const result = await fetchFunction(page, perPage);

      if (!isMountedRef.current) return;

      setState(prev => ({
        ...prev,
        data: isLoadingMore ? [...prev.data, ...result.data] : result.data,
        page,
        perPage,
        total: result.total,
        hasMore: result.hasMore,
        isLoading: false,
        isLoadingMore: false,
      }));

      // Prefetch next page if enabled
      if (prefetchNext && result.hasMore && !isLoadingMore) {
        prefetchPage(page + 1, perPage);
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      // Don't set error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') return;

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  }, [fetchFunction, prefetchNext]);

  // Prefetch next page (silent)
  const prefetchPage = useCallback(async (page: number, perPage: number): Promise<void> => {
    try {
      await fetchFunction(page, perPage);
    } catch {
      // Silently fail prefetch
    }
  }, [fetchFunction]);

  // Go to specific page
  const goToPage = useCallback(async (page: number): Promise<void> => {
    if (page < 1) return;
    if (page === state.page && state.data.length > 0) return;
    
    await fetchData(page, state.perPage);
  }, [fetchData, state.page, state.perPage, state.data.length]);

  // Go to next page
  const nextPage = useCallback(async (): Promise<void> => {
    if (!state.hasMore || state.isLoading || state.isLoadingMore) return;
    await fetchData(state.page + 1, state.perPage);
  }, [fetchData, state.page, state.perPage, state.hasMore, state.isLoading, state.isLoadingMore]);

  // Go to previous page
  const previousPage = useCallback(async (): Promise<void> => {
    if (state.page <= 1) return;
    await fetchData(state.page - 1, state.perPage);
  }, [fetchData, state.page, state.perPage]);

  // Refresh current page
  const refresh = useCallback(async (): Promise<void> => {
    await fetchData(state.page, state.perPage);
  }, [fetchData, state.page, state.perPage]);

  // Load more (append mode)
  const loadMore = useCallback(async (): Promise<void> => {
    if (!state.hasMore || state.isLoading || state.isLoadingMore) return;
    await fetchData(state.page + 1, state.perPage, true);
    setState(prev => ({ ...prev, page: prev.page + 1 }));
  }, [fetchData, state.page, state.perPage, state.hasMore, state.isLoading, state.isLoadingMore]);

  // Change per page
  const setPerPage = useCallback((newPerPage: number): void => {
    setState(prev => ({ ...prev, perPage: newPerPage }));
    // Refetch with new perPage
    fetchData(1, newPerPage);
  }, [fetchData]);

  // Get current page data
  const getPageData = useCallback((): T[] => {
    return state.data;
  }, [state.data]);

  // Get total pages
  const getTotalPages = useCallback((): number => {
    return Math.ceil(state.total / state.perPage);
  }, [state.total, state.perPage]);

  // Initial load
  useEffect(() => {
    fetchData(initialPage, initialPerPage);
  }, []); // Only on mount

  return {
    ...state,
    goToPage,
    nextPage,
    previousPage,
    refresh,
    loadMore,
    setPerPage,
    getPageData,
    getTotalPages,
  };
}

export default usePagination;
