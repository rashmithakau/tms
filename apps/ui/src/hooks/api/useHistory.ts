import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../../api/history';
import { HistoryRecord, HistoryFilter } from '../../interfaces/api';

export const useHistory = (initialFilters: HistoryFilter = {}) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilter>(initialFilters);

  const fetchHistory = useCallback(async (currentFilters: HistoryFilter = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getHistory(currentFilters);
      setHistory(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(filters);
  }, [filters, fetchHistory]);

  const applyFilters = useCallback((newFilters: HistoryFilter) => {
    setFilters(newFilters);
  }, []);

  const refresh = useCallback(() => {
    fetchHistory(filters);
  }, [fetchHistory, filters]);

  return {
    history,
    loading,
    error,
    filters,
    applyFilters,
    refresh,
  };
};

