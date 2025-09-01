import API  from "../config/apiClient";
import { UserRole } from "@tms/shared";
  
  export const registerUser = async (data:any,role:UserRole) => {
    try {
      switch(role){
        case UserRole.Admin:return await API.post("/api/user/admin", data);
        case UserRole.Emp:return await API.post("/api/user/emp", data);
      }
    } catch (error) {
      console.error("User registration failed:", error);
      throw error; 
    }
  };

  export const getUsers = async (role:UserRole) => {
    try {
      switch(role){
        case UserRole.Admin:return await API.get("/api/user/admin");
        case UserRole.Emp:return await API.get("/api/user/emp");
        case UserRole.Supervisor:return await API.get("/api/user/supervisor");
      }
    } catch (error) {
      console.error("Users fetching failed:", error);
      throw error; 
    }
  };

  // Projects API
  export type ProjectListItem = {
    _id: string;
    projectName: string;
    billable: boolean;
    employees: { firstName: string; lastName: string; email: string }[];
    createdAt?: string;
  };

  export const listProjects = async () => {
    try {
      return await API.get("/api/project");
    } catch (error) {
      console.error("Projects fetching failed:", error);
      throw error;
    }
  };

  export const getAllActiveUsers = async () => {
    try {
      const response = await API.get("/api/user/active");
      return response;
    } catch (error) {
      console.error('Get all active users failed:', error);
      throw error;
    }
  };

  export const getAllUsersIncludingInactive = async (roles: string[]) => {
    try {
      const queryParams = roles.map(role => `roles=${role}`).join('&');
      const response = await API.get(`/api/user/all?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Get all users including inactive failed:', error);
      throw error;
    }
  };


export const deleteUser = async (userId: string) => {
  console.log('Making delete request to:', `/api/user/${userId}`);
  try {
    const response = await API.delete(`/api/user/${userId}`);
    console.log('Delete response:', response);
    return response;
  } catch (error) {
    console.error('Delete API error:', error);
    throw error;
  }
};