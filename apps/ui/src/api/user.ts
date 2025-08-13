import API  from "../config/apiClient";
  
  export const registerUser = async (data: any) => {
    try {
      return await API.post("/api/user", data);
    } catch (error) {
      console.error("User registration failed:", error);
      throw error; 
    }
  };