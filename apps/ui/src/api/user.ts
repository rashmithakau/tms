import API  from "../config/apiClient";
import { UserRole } from "@tms/shared";
  
  export const registerUser = async (data:unknown,role:UserRole) => {
  switch(role){
    case UserRole.Admin:return await API.post("/user/admin", data);
    case UserRole.Emp:return await API.post("/user/emp", data);
  }
};

  export const getUsers = async (role:UserRole) => {
  switch(role){
    case UserRole.Admin:return await API.get(`/user/all?roles=${UserRole.Admin}`);
    case UserRole.Emp:return await API.get("/user/emp");
    case UserRole.Supervisor:
      return await API.get(`/user/all?roles=${UserRole.Supervisor}`);
    case UserRole.SupervisorAdmin:
      return await API.get(`/user/all?roles=${UserRole.SupervisorAdmin}`);
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
  return await API.get("/project");
};

  export const getAllActiveUsers = async () => {
  const response = await API.get("/user/active");
  return response;
};

  export const getAllUsersIncludingInactive = async (roles: string[]) => {
  const queryParams = roles.map(role => `roles=${role}`).join('&');
  const response = await API.get(`/user/all?${queryParams}`);
  return response;
};


export const deleteUser = async (userId: string) => {
  const response = await API.delete(`/user/${userId}`);
  return response;
};

export const updateUser = async (
  userId: string,
  data: Partial<{ designation: string; contactNumber: string; status: boolean }>
) => {
  const response = await API.patch(`/user/${userId}` , data);
  return response;
};