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