import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../../api/history';
import { HistoryRecord } from '../../interfaces/api';

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getHistory({});
      setHistory(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refresh,
  };
};

