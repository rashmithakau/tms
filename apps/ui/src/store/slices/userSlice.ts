import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../interfaces/IUser";
import { UserState } from "../../interfaces/UserState";
import { login } from "../../api/auth";
import Cookies from "js-cookie";

const initialState: UserState = {
  loading: false,
  user: null, // Ensure components handle null gracefully
  error: "",
  isAuthenticated: false,
};

export const fetchUser = createAsyncThunk<IUser, { email: string; password: string }>(
  "login/fetchUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await login({ email, password });

      const isAuthenticated = response.data.user !== null && response.data.user !== undefined;
      // Store values in localStorage
      localStorage.setItem("isAuthenticated", String(isAuthenticated));
      localStorage.setItem("userRole", response.data.user.role);
      localStorage.setItem("_id", response.data.user._id);

      return response.data.user; // Return only the user object
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
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
      state.error = "";
    });
    builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchUser.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch user";
      state.isAuthenticated = false;
    });
  },
});

export default userSlice.reducer;