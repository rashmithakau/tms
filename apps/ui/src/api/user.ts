import API  from "../config/apiClient";
import { UserRole } from "@tms/shared";
  
  export const registerUser = async (data:any,role:UserRole) => {
    try {
      switch(role){
        case UserRole.Admin:return await API.post("/api/user/admin", data);
        case UserRole.Emp:return await API.post("/api/user/emp", data);
      }
    } catch (error) {
      throw error; 
    }
  };

  export const getUsers = async (role:UserRole) => {
    try {
      switch(role){
        case UserRole.Admin:return await API.get(`/api/user/all?roles=${UserRole.Admin}`);
        case UserRole.Emp:return await API.get("/api/user/emp");
        case UserRole.Supervisor:
        case UserRole.SupervisorAdmin:
          return await API.get("/api/user/supervisor");
      }
    } catch (error) {
      throw error; 
    }
  };

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
      throw error;
    }
  };

  export const getAllActiveUsers = async () => {
    try {
      const response = await API.get("/api/user/active");
      return response;
    } catch (error) {
      throw error;
    }
  };

  export const getAllUsersIncludingInactive = async (roles: string[]) => {
    try {
      const queryParams = roles.map(role => `roles=${role}`).join('&');
      const response = await API.get(`/api/user/all?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  };


export const deleteUser = async (userId: string) => {
  try {
    const response = await API.delete(`/api/user/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  data: Partial<{ designation: string; contactNumber: string; status: boolean }>
) => {
  try {
    const response = await API.patch(`/api/user/${userId}` , data);
    return response;
  } catch (error) {
    throw error;
  }
};