import { configureStore, combineReducers } from "@reduxjs/toolkit";
import dashboardNavReducer from './slices/dashboardNavSlice'; 
import empMenuNavReducer from './slices/empMenuNavSclice'; 
import searchBarReducer from './slices/SearchBarSlice';
import timesheets from "./slices/timesheetSlice";

const appReducer = combineReducers({
    dashboardNav: dashboardNavReducer,
    empMenuNav: empMenuNavReducer,
    searchBar: searchBarReducer,
    timesheet:timesheets,
});


const rootReducer = (state: any, action: any) => {
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
});

export default store;