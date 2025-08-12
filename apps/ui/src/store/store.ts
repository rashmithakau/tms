import { configureStore } from "@reduxjs/toolkit";
import dashboardNavReducer from './slices/dashboardNavSlice';
import userReducer from './slices/userSlice'; 

const store = configureStore({
    reducer: {
        dashboardNav: dashboardNavReducer,
        user: userReducer, 
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;