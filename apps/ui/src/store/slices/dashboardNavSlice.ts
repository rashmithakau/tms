import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import  {IDashboardNavState}  from "../../interfaces/navigation/IDashboardNavState";

const initialState: IDashboardNavState = {
  selectedBtn: "Dashboard",
};

const dashboardNavSlice = createSlice({
  name: "dashboardNav",
  initialState,
  reducers: {
    select_btn: (state, action: PayloadAction<string>) => {
      state.selectedBtn = action.payload;
    },
  },
});

export default dashboardNavSlice.reducer;
export const { select_btn } = dashboardNavSlice.actions;
