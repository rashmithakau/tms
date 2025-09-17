import { useCallback, useEffect, useState } from 'react';
import { listProjects } from '../api/project';
import { ProjectListItem } from '../api/project';

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await listProjects();
      const data = resp.data?.projects || [];
      setProjects(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load projects';
      setError(message);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { projects, isLoading, error, refresh: fetchData };
};


