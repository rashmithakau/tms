import API from '../config/apiClient';
import { 
  DashboardStats, 
  RejectedTimesheet, 
} from '../interfaces/api';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await API.get('/api/dashboard/stats');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getRejectedTimesheets = async (limit?: number): Promise<RejectedTimesheet[]> => {
  try {
    const params = limit ? { limit } : {};
    const response = await API.get('/api/dashboard/rejected-timesheets', { params });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getTimesheetRejectionReasons = async (limit?: number): Promise<string[]> => {
  try {
    const params = limit ? { limit } : {};
    const response = await API.get('/api/dashboard/rejected-timesheets', { params });
    return response.data.data; 
  } catch (error) {
    throw error;
  }
};
