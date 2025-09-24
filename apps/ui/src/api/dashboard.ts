import API from '../config/apiClient';
import { 
  DashboardStats, 
  RejectedTimesheet, 
  TimesheetRejectionReason 
} from '../interfaces/api';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await API.get('/api/dashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRejectedTimesheets = async (limit?: number): Promise<RejectedTimesheet[]> => {
  try {
    const params = limit ? { limit } : {};
    const response = await API.get('/api/dashboard/rejected-timesheets', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching rejected timesheets:', error);
    throw error;
  }
};

// New function for fetching rejection reasons only
export const getTimesheetRejectionReasons = async (limit?: number): Promise<string[]> => {
  try {
    const params = limit ? { limit } : {};
    const response = await API.get('/api/dashboard/rejected-timesheets', { params });
    return response.data.data; // Now returns array of strings
  } catch (error) {
    console.error('Error fetching timesheet rejection reasons:', error);
    throw error;
  }
};
