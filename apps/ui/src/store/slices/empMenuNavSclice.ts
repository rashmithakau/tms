import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {EmpMenuItem} from '@tms/shared';
import {IDashboardNavState} from "../../interfaces/navigation/IDashboardNavState";

const initialState: IDashboardNavState = {
  selectedBtn: EmpMenuItem.MyTimesheets,
};

const empMenuNavSlice = createSlice({
  name: "empMenuNav",
  initialState,
  reducers: {
    select_btn: (state, action: PayloadAction<string>) => {
      state.selectedBtn = action.payload;
    },
  },
});

export default empMenuNavSlice.reducer;
export const { select_btn } = empMenuNavSlice.actions;
