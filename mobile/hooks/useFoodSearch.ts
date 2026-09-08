import { useState, useEffect, useRef, useCallback } from 'react';
import { searchFoods, lookupBarcode, SearchFood } from '@/services/openfoodfacts';

const DEBOUNCE_MS = 400;
const MIN_CHARS = 2;

export function useFoodSearch() {
  const [query, setQueryRaw] = useState('');
  const [results, setResults] = useState<SearchFood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard against stale responses
  const activeQueryRef = useRef('');
  // When true, the query was set by a barcode lookup — skip text search
  const isBarcodeQueryRef = useRef(false);

  // Exposed setQuery: clears barcode flag so text search can run
  const setQuery = useCallback((q: string) => {
    isBarcodeQueryRef.current = false;
    setQueryRaw(q);
  }, []);

  useEffect(() => {
    // Don't run text search when query was set by barcode lookup
    if (isBarcodeQueryRef.current) return;

    if (query.length < MIN_CHARS) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      activeQueryRef.current = '';
      return;
    }

    setIsLoading(true);
    setError(null);
    activeQueryRef.current = query;

    const timer = setTimeout(async () => {
      try {
        const data = await searchFoods(query);
        // Only apply results if the query hasn't changed
        if (activeQueryRef.current === query) {
          setResults(data);
          setIsLoading(false);
        }
      } catch (e: any) {
        if (activeQueryRef.current === query) {
          setError(e.message ?? 'Search failed');
          setResults([]);
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = useCallback(() => {
    isBarcodeQueryRef.current = false;
    setQueryRaw('');
    setResults([]);
    setError(null);
    setIsLoading(false);
    activeQueryRef.current = '';
  }, []);

  const searchByBarcode = useCallback(async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const product = await lookupBarcode(barcode);
      if (product) {
        setResults([product]);
        // Set query for display without triggering text search
        isBarcodeQueryRef.current = true;
        setQueryRaw(barcode);
      } else {
        setResults([]);
        setError('No product found for this barcode');
        isBarcodeQueryRef.current = true;
        setQueryRaw(barcode);
      }
    } catch (e: any) {
      setError(e.message ?? 'Barcode lookup failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { query, setQuery, results, isLoading, error, clearSearch, searchByBarcode };
}
