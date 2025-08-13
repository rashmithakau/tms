import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { IUser } from "../../interfaces/IUser";
import { UserState } from "../../interfaces/UserState";
import {login} from "../../api/auth";


const initialState: UserState = {
  loading: false,
  user:null,
  error: "",
};


const apiUrl = import.meta.env.VITE_API_URL;

export const fetchUser = createAsyncThunk<IUser, { email: string; password: string }>(
  "login/fetchUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      
      // const response = await axios.post(`${apiUrl}/auth/login`, {
      //   email,
      //   password,
      // },
      // { withCredentials: true }  );
      const response = await login({ email, password });


      console.log("Login response:", response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.loading = false;
      state.error = String(action.error.message) ;
    });
  },
});

export default userSlice.reducer;
