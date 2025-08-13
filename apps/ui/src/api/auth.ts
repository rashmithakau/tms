import API  from "../config/apiClient";
import { ILoginDetails } from "../interfaces/ILoginDetails";

export const login = async (data: ILoginDetails) => {
    try {
      return await API.post("/auth/login", data);
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw the error for the caller to handle
    }
  };
  
  export const registerUser = async (data: any) => {
    try {
      return await API.post("/api/user", data);
    } catch (error) {
      console.error("User registration failed:", error);
      throw error; // Re-throw the error for the caller to handle
    }
  };