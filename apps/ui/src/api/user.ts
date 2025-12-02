import API  from "../config/apiClient";
import { UserRole } from "@tms/shared";
  
  export const registerUser = async (data:unknown,role:UserRole) => {
  switch(role){
    case UserRole.Admin:return await API.post("/api/user/admin", data);
    case UserRole.Emp:return await API.post("/api/user/emp", data);
  }
};

  export const getUsers = async (role:UserRole) => {
  switch(role){
    case UserRole.Admin:return await API.get(`/api/user/all?roles=${UserRole.Admin}`);
    case UserRole.Emp:return await API.get("/api/user/emp");
    case UserRole.Supervisor:
      return await API.get(`/api/user/all?roles=${UserRole.Supervisor}`);
    case UserRole.SupervisorAdmin:
      return await API.get(`/api/user/all?roles=${UserRole.SupervisorAdmin}`);
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
  return await API.get("/api/project");
};

  export const getAllActiveUsers = async () => {
  const response = await API.get("/api/user/active");
  return response;
};

  export const getAllUsersIncludingInactive = async (roles: string[]) => {
  const queryParams = roles.map(role => `roles=${role}`).join('&');
  const response = await API.get(`/api/user/all?${queryParams}`);
  return response;
};


export const deleteUser = async (userId: string) => {
  const response = await API.delete(`/api/user/${userId}`);
  return response;
};

export const updateUser = async (
  userId: string,
  data: Partial<{ designation: string; contactNumber: string; status: boolean }>
) => {
  const response = await API.patch(`/api/user/${userId}` , data);
  return response;
};