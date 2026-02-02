/**
 * useLazyLoad Hook - Lazy Loading for Images and Components
 * 
 * Features:
 * - Intersection Observer-based lazy loading
 * - Image loading with blur-up placeholder
 * - Component code splitting
 * - Skeleton loading states
 * 
 * Core Principles:
 * - PERFORMANT: Load only when needed
 * - CLEAN: Clear loading state management
 * - MODULAR: Works with images and components
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

// ============= Types =============

interface LazyImageState {
  src: string | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

interface LazyComponentState<T> {
  Component: T | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

interface UseLazyImageOptions {
  src: string;
  placeholderSrc?: string;
  rootMargin?: string;
  threshold?: number;
}

interface UseLazyComponentOptions {
  importFn: () => Promise<{ default: any }>;
  rootMargin?: string;
  threshold?: number;
}

// ============= Lazy Image Hook =============

export function useLazyImage(options: UseLazyImageOptions): LazyImageState {
  const { src, placeholderSrc, rootMargin = '50px', threshold = 0.1 } = options;
  
  const [state, setState] = useState<LazyImageState>({
    src: placeholderSrc || null,
    isLoading: false,
    isLoaded: false,
    error: null,
  });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    // Check if image is already cached
    const img = new Image();
    img.src = src;
    
    if (img.complete) {
      setState({
        src,
        isLoading: false,
        isLoaded: true,
        error: null,
      });
      return;
    }

    // Set up intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState((prev) => ({ ...prev, isLoading: true }));

            const loadImg = new Image();
            
            loadImg.onload = () => {
              setState({
                src,
                isLoading: false,
                isLoaded: true,
                error: null,
              });
            };

            loadImg.onerror = () => {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load image',
              }));
            };

            loadImg.src = src;

            // Stop observing once triggered
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, placeholderSrc, rootMargin, threshold]);

  return { ...state, ref: imageRef } as LazyImageState & { ref: typeof imageRef };
}

// ============= Lazy Component Hook =============

export function useLazyComponent<T>(options: UseLazyComponentOptions): LazyComponentState<T> {
  const { importFn, rootMargin = '100px', threshold = 0 } = options;
  
  const [state, setState] = useState<LazyComponentState<T>>({
    Component: null,
    isLoading: false,
    isLoaded: false,
    error: null,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || hasTriggeredRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            setState((prev) => ({ ...prev, isLoading: true }));

            importFn()
              .then((module) => {
                setState({
                  Component: module.default,
                  isLoading: false,
                  isLoaded: true,
                  error: null,
                });
              })
              .catch((error) => {
                setState({
                  Component: null,
                  isLoading: false,
                  isLoaded: false,
                  error: error instanceof Error ? error.message : 'Failed to load component',
                });
              });

            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [importFn, rootMargin, threshold]);

  return { ...state, ref: containerRef } as LazyComponentState<T> & { ref: typeof containerRef };
}

// ============= Lazy Gallery Hook =============

interface GalleryItem {
  id: string;
  src: string;
  placeholderSrc?: string;
  alt: string;
}

interface GalleryState {
  visibleItems: string[];
  loadedItems: string[];
}

export function useLazyGallery(items: GalleryItem[], options: { 
  rootMargin?: string; 
  threshold?: number;
  batchSize?: number;
} = {}) {
  const { rootMargin = '100px', threshold = 0.1, batchSize = 5 } = options;
  
  const [state, setState] = useState<GalleryState>({
    visibleItems: [],
    loadedItems: [],
  });

  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());

  const observeItem = useCallback((id: string, element: HTMLElement | null) => {
    if (!element || observersRef.current.has(id)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState((prev) => ({
              ...prev,
              visibleItems: [...prev.visibleItems, id],
            }));
            observer.unobserve(entry.target);
            observersRef.current.delete(id);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    observersRef.current.set(id, observer);
  }, [rootMargin, threshold]);

  const markLoaded = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      loadedItems: [...prev.loadedItems, id],
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
    };
  }, []);

  // Determine which items to preload
  const getPreloadIds = useCallback((): string[] => {
    const lastVisibleIndex = Math.max(
      ...state.visibleItems.map((id) => items.findIndex((item) => item.id === id)),
      -1
    );
    
    return items
      .slice(lastVisibleIndex + 1, lastVisibleIndex + 1 + batchSize)
      .map((item) => item.id);
  }, [items, state.visibleItems, batchSize]);

  return {
    visibleItems: state.visibleItems,
    loadedItems: state.loadedItems,
    observeItem,
    markLoaded,
    preloadIds: getPreloadIds(),
    isVisible: (id: string) => state.visibleItems.includes(id),
    isLoaded: (id: string) => state.loadedItems.includes(id),
  };
}

// ============= Skeleton Components =============

export const ImageSkeleton: FunctionalComponent<{ className?: string }> = ({ className = '' }) => (
  <div class={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}>
    <div class="flex items-center justify-center h-full">
      <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
);

export const CardSkeleton: FunctionalComponent = () => (
  <div class="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export const TextSkeleton: FunctionalComponent<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div class={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i}
        class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      ></div>
    ))}
  </div>
);

// ============= Web Worker Hook for ZK Proofs =============

interface UseZKProofWorkerOptions {
  workerUrl: string;
}

interface ZKProofWorkerState {
  isGenerating: boolean;
  result: unknown | null;
  error: string | null;
}

export function useZKProofWorker(options: UseZKProofWorkerOptions) {
  const { workerUrl } = options;
  
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<ZKProofWorkerState>({
    isGenerating: false,
    result: null,
    error: null,
  });

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (event) => {
      const { type, result, error } = event.data;
      
      if (type === 'success') {
        setState({
          isGenerating: false,
          result,
          error: null,
        });
      } else if (type === 'error') {
        setState({
          isGenerating: false,
          result: null,
          error,
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [workerUrl]);

  const generateProof = useCallback((data: unknown) => {
    if (!workerRef.current) return;
    
    setState({
      isGenerating: true,
      result: null,
      error: null,
    });
    
    workerRef.current.postMessage({ type: 'generate', data });
  }, []);

  const verifyProof = useCallback((proof: unknown, publicInputs: unknown) => {
    if (!workerRef.current) return;
    
    setState({
      isGenerating: true,
      result: null,
      error: null,
    });
    
    workerRef.current.postMessage({ type: 'verify', proof, publicInputs });
  }, []);

  return {
    ...state,
    generateProof,
    verifyProof,
  };
}

// ============= Export =============

export default {
  useLazyImage,
  useLazyComponent,
  useLazyGallery,
  useZKProofWorker,
  ImageSkeleton,
  CardSkeleton,
  TextSkeleton,
};
