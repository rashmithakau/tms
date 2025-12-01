import API from '../config/apiClient';
import { 
  DashboardStats, 
  RejectedTimesheet, 
} from '../interfaces/api';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  
    const response = await API.get('/api/dashboard/stats');
    return response.data.data;
  
};

export const getRejectedTimesheets = async (limit?: number): Promise<RejectedTimesheet[]> => {
  
    const params = limit ? { limit } : {};
    const response = await API.get('/api/dashboard/rejected-timesheets', { params });
    return response.data.data;
  
};

export const getTimesheetRejectionReasons = async (limit?: number): Promise<string[]> => {
  
    const params = limit ? { limit } : {};
    const response = await API.get('/api/dashboard/rejected-timesheets', { params });
    return response.data.data; 
 
};
