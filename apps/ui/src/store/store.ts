import { configureStore } from "@reduxjs/toolkit";
import dashboardNavReducer from './slices/dashboardNavSlice'; 

const store = configureStore({
    reducer: {
        dashboardNav: dashboardNavReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;