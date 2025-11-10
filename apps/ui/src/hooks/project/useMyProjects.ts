import { useState, useEffect } from 'react';
import { listMyProjects } from '../../api/project';

interface Project {
  _id: string;
  projectName: string;
}

export const useMyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await listMyProjects();
        setProjects(response.data?.projects || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load projects');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, isLoading, error };
};
