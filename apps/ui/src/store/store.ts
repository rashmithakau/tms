import { configureStore } from "@reduxjs/toolkit";
import dashboardNavReducer from './slices/dashboardNavSlice'; 
import empMenudNavReducer from './slices/empMenuNavSclice'; 

const store = configureStore({
    reducer: {
        dashboardNav: dashboardNavReducer,
        empMenuNav:empMenudNavReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;