import { useState, useEffect } from 'react';
import { getDashboardStats, getTimesheetRejectionReasons, getRejectedTimesheets } from '../../api/dashboard';
import { DashboardStats, RejectedTimesheet } from '../../interfaces/api';

export const useDashboardStats = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    dashboardStats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};

export const useTimesheetRejectionReasons = (limit?: number) => {
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRejectionReasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const reasons = await getTimesheetRejectionReasons(limit);
      setRejectionReasons(reasons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rejection reasons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectionReasons();
  }, [limit]);

  return {
    rejectionReasons,
    loading,
    error,
    refetch: fetchRejectionReasons
  };
};

// Keep the old hook for backward compatibility but deprecated
export const useRejectedTimesheets = (limit?: number) => {
  const [rejectedTimesheets, setRejectedTimesheets] = useState<RejectedTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRejectedTimesheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const timesheets = await getRejectedTimesheets(limit);
      setRejectedTimesheets(timesheets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rejected timesheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedTimesheets();
  }, [limit]);

  return {
    rejectedTimesheets,
    loading,
    error,
    refetch: fetchRejectedTimesheets
  };
};
