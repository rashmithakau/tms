import API from '../config/apiClient';
import { HistoryFilter, HistoryResponse } from '../interfaces/api';

export const getHistory = async (filter: HistoryFilter = {}): Promise<HistoryResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filter.actionType && filter.actionType.length > 0) {
      filter.actionType.forEach(type => params.append('actionType', type));
    }
    
    if (filter.entityType && filter.entityType.length > 0) {
      filter.entityType.forEach(type => params.append('entityType', type));
    }
    
    if (filter.performedBy) {
      params.append('performedBy', filter.performedBy);
    }
    
    if (filter.startDate) {
      params.append('startDate', filter.startDate);
    }
    
    if (filter.endDate) {
      params.append('endDate', filter.endDate);
    }
    
    if (filter.page) {
      params.append('page', filter.page.toString());
    }
    
    if (filter.limit) {
      params.append('limit', filter.limit.toString());
    }
    
    const response = await API.get(`/api/history?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
